/**
 * The single-player AI opponent ("greedy" difficulty).
 *
 * Reads battle state and returns decisions; never mutates state. It must be
 * given its OWN Rng, never one built from the battle's rngState, so AI
 * choices can't shift the battle's random rolls (docs/adr/0001, 0002).
 * Randomness is only used to break exact ties.
 */
import {
  activeOf,
  canReceiveStatus,
  createCombatant,
  expectedDamage,
  isNeutralized,
  legalChoices,
  switchTargets,
  typeEffectiveness,
  validateTeam,
  TEAM_SIZE,
  type BattleState,
  type Choice,
  type Combatant,
  type Dex,
  type MoveData,
  type Rng,
  type SideIndex,
} from '../engine'

/** Heal when at or below this fraction of max HP. */
export const HEAL_THRESHOLD = 0.4
/** Prefer a status move when no attack would do at least this share of the target's HP. */
export const STATUS_DAMAGE_THRESHOLD = 0.35

// ---------------------------------------------------------------------------
// Team building and Team Preview
// ---------------------------------------------------------------------------

/** A random legal team (4 distinct SCPs within budget) from `pool` (default: whole Dex). */
export function randomTeam(dex: Dex, rng: Rng, pool: readonly string[] = Object.keys(dex.species)): string[] {
  for (let attempt = 0; attempt < 10_000; attempt++) {
    const remaining = [...pool]
    const team: string[] = []
    while (team.length < TEAM_SIZE && remaining.length > 0) {
      team.push(remaining.splice(rng.int(0, remaining.length - 1), 1)[0])
    }
    if (validateTeam(dex, team).length === 0) return team
  }
  throw new Error('could not build a legal team from this pool')
}

/** Team Preview: the SCP with the best average matchup against the whole opposing team. */
export function chooseLead(
  dex: Dex,
  myTeam: readonly string[],
  opponentTeam: readonly string[],
  rng: Rng,
): number {
  const mine = myTeam.map((id) => createCombatant(dex, id))
  const theirs = opponentTeam.map((id) => createCombatant(dex, id))
  const scores = mine.map(
    (me) => theirs.reduce((sum, opp) => sum + matchupScore(dex, me, opp), 0) / theirs.length,
  )
  return pickBest(scores.map((score, i) => ({ value: i, score })), rng)
}

// ---------------------------------------------------------------------------
// In battle
// ---------------------------------------------------------------------------

/** The AI's Choice for this turn. Always legal. */
export function chooseAction(state: BattleState, dex: Dex, side: SideIndex, rng: Rng): Choice {
  const legal = legalChoices(state, side)
  if (legal.length === 0) throw new Error(`side ${side} has no legal choices (phase ${state.phase})`)
  const me = activeOf(state, side)
  const opp = activeOf(state, side === 0 ? 1 : 0)
  const moves = movesOf(dex, me)

  // 1. Escape a x4 weakness, if a teammate resists it and we didn't just come in.
  const switchTo = escapeSwitch(state, dex, side, me, opp, legal, rng)
  if (switchTo !== null) return { kind: 'switch', teamIndex: switchTo }

  // 2. Heal when low.
  if (me.hp <= me.stats.hp * HEAL_THRESHOLD) {
    const heal = moves.findIndex((m) => m.effects?.some((e) => e.kind === 'heal'))
    if (heal >= 0) return { kind: 'move', moveIndex: heal }
  }

  // 3. Inflict a status when attacks are weak against this target.
  const attackScores = moves.map((m) => expectedShare(dex, me, opp, m))
  if (Math.max(...attackScores) < STATUS_DAMAGE_THRESHOLD) {
    const statusMoves = moves.flatMap((m, i) => {
      if (m.category !== 'Status') return []
      const inflicts = m.effects?.find((e) => e.kind === 'status')
      if (!inflicts || inflicts.kind !== 'status') return []
      if (!canReceiveStatus(dex, opp, inflicts.status)) return []
      return [{ value: i, score: (m.accuracy ?? 100) / 100 }]
    })
    if (statusMoves.length > 0) return { kind: 'move', moveIndex: pickBest(statusMoves, rng) }
  }

  // 4. Otherwise, the attack with the highest expected damage.
  return {
    kind: 'move',
    moveIndex: pickBest(attackScores.map((score, i) => ({ value: i, score })), rng),
  }
}

/** Which benched SCP to send in after the active was Neutralized. */
export function chooseReplacement(state: BattleState, dex: Dex, side: SideIndex, rng: Rng): number {
  const options = switchTargets(state, side)
  if (options.length === 0) throw new Error(`side ${side} has nothing to send in`)
  const oppSide = state.sides[side === 0 ? 1 : 0]
  const oppActive = oppSide.team[oppSide.active]
  // If the opponent is also replacing, judge against their whole remaining team.
  const opponents = isNeutralized(oppActive)
    ? oppSide.team.filter((c) => !isNeutralized(c))
    : [oppActive]
  const team = state.sides[side].team
  return pickBest(
    options.map((i) => ({
      value: i,
      score:
        opponents.reduce((sum, opp) => sum + matchupScore(dex, team[i], opp), 0) / opponents.length,
    })),
    rng,
  )
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function movesOf(dex: Dex, c: Combatant): MoveData[] {
  return dex.species[c.speciesId].moves.map((id) => dex.moves[id])
}

/** Expected share of the target's current HP one use of `move` removes (accuracy included, capped at 1). */
function expectedShare(dex: Dex, user: Combatant, target: Combatant, move: MoveData): number {
  if (move.category === 'Status' || target.hp <= 0) return 0
  const dmg = expectedDamage(dex, user, target, move) * ((move.accuracy ?? 100) / 100)
  return Math.min(1, dmg / target.hp)
}

function bestShare(dex: Dex, user: Combatant, target: Combatant): number {
  return Math.max(0, ...movesOf(dex, user).map((m) => expectedShare(dex, user, target, m)))
}

/** Best share I deal minus best share I take. Higher is better for `me`. */
export function matchupScore(dex: Dex, me: Combatant, opp: Combatant): number {
  return bestShare(dex, me, opp) - bestShare(dex, opp, me)
}

function escapeSwitch(
  state: BattleState,
  dex: Dex,
  side: SideIndex,
  me: Combatant,
  opp: Combatant,
  legal: readonly Choice[],
  rng: Rng,
): number | null {
  // Don't bounce straight back out of an SCP that just came in.
  if (me.volatiles.enteredTurn > 0 && me.volatiles.enteredTurn >= state.turn - 1) return null

  const myTypes = dex.species[me.speciesId].types
  const threats = movesOf(dex, opp).filter(
    (m) => m.category !== 'Status' && typeEffectiveness(m.type, myTypes) >= 4,
  )
  if (threats.length === 0) return null

  const team = state.sides[side].team
  const candidates = legal.flatMap((c) => {
    if (c.kind !== 'switch') return []
    const types = dex.species[team[c.teamIndex].speciesId].types
    const resistsAll = threats.every((m) => typeEffectiveness(m.type, types) <= 0.5)
    return resistsAll ? [{ value: c.teamIndex, score: matchupScore(dex, team[c.teamIndex], opp) }] : []
  })
  return candidates.length > 0 ? pickBest(candidates, rng) : null
}

/** Highest score wins; exact ties are broken with the AI's own RNG. */
function pickBest<T>(options: readonly { value: T; score: number }[], rng: Rng): T {
  const top = Math.max(...options.map((o) => o.score))
  const best = options.filter((o) => o.score === top)
  return best.length === 1 ? best[0].value : best[rng.int(0, best.length - 1)].value
}
