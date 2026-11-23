import { chooseAction, chooseLead, chooseReplacement, randomTeam } from '../ai'
import {
  activeOf,
  createRng,
  isNeutralized,
  resolveReplacements,
  resolveTurn,
  startBattle,
  teamCost,
  TEAM_SIZE,
  validateTeam,
  type BattleState,
  type Dex,
  type Rng,
  type SideIndex,
} from '../engine'

/**
 * AI-vs-AI balance simulation (docs/adr/0003). Every SCP in `focus` is
 * guaranteed `battlesPerScp` battles on a random legal team built around it,
 * against a random legal team; every SCP in a battle is tallied, focused or
 * not. Deterministic for a given seed.
 */

export interface Tally {
  battles: number
  wins: number
  /** Sweeps (see GLOSSARY.md): battles in which it Neutralized half or more of the opposing team. */
  sweeps: number
}

export interface BalanceResult {
  battles: number
  /** Battles that reached the turn limit. */
  timeouts: number
  perScp: Record<string, Tally>
  /** By team makeup: object-class initials, sorted (e.g. "EESS"). */
  perMakeup: Record<string, Tally & { cost: number }>
  /** How many times each move was used (Struggle excluded). */
  moveUses: Record<string, number>
}

/** A random legal team that includes `required`. */
export function randomTeamWith(dex: Dex, rng: Rng, pool: readonly string[], required: string): string[] {
  const others = pool.filter((id) => id !== required)
  for (let attempt = 0; attempt < 10_000; attempt++) {
    const rest = [...others]
    const team = [required]
    while (team.length < TEAM_SIZE && rest.length > 0) team.push(rest.splice(rng.int(0, rest.length - 1), 1)[0])
    if (validateTeam(dex, team).length === 0) return team
  }
  throw new Error(`no legal team includes ${required}`)
}

export const makeupOf = (dex: Dex, team: readonly string[]) =>
  team.map((id) => dex.species[id].objectClass[0]).sort().join('')

/** Play one AI-vs-AI battle; returns the final state, Neutralizations per team slot, and moves used. */
function playBattle(dex: Dex, teams: [string[], string[]], seed: number, rng: Rng) {
  const leads: [number, number] = [
    chooseLead(dex, teams[0], teams[1], rng),
    chooseLead(dex, teams[1], teams[0], rng),
  ]
  let s: BattleState = startBattle(dex, teams, leads, seed).state
  const kos = [teams[0].map(() => 0), teams[1].map(() => 0)]
  const moves: string[] = []
  while (s.phase !== 'ended') {
    if (s.phase === 'replace') {
      const picks = ([0, 1] as const).map((side) =>
        isNeutralized(activeOf(s, side)) && s.sides[side].team.some((c) => !isNeutralized(c))
          ? chooseReplacement(s, dex, side, rng)
          : null,
      ) as [number | null, number | null]
      s = resolveReplacements(s, dex, picks).state
      continue
    }
    const actives = [s.sides[0].active, s.sides[1].active]
    const r = resolveTurn(s, dex, [chooseAction(s, dex, 0, rng), chooseAction(s, dex, 1, rng)])
    for (const e of r.events) {
      // Credit each Neutralization to whoever was active on the other side.
      if (e.type === 'neutralized') {
        const by = (1 - e.side) as SideIndex
        kos[by][actives[by]]++
      }
      if (e.type === 'move' && e.moveId !== 'struggle') moves.push(e.moveId)
    }
    s = r.state
  }
  return { state: s, kos, moves }
}

export function simulateBalance(
  dex: Dex,
  pool: readonly string[],
  focus: readonly string[],
  battlesPerScp: number,
  seed = 1,
): BalanceResult {
  const result: BalanceResult = { battles: 0, timeouts: 0, perScp: {}, perMakeup: {}, moveUses: {} }
  let n = seed
  for (const id of focus) {
    for (let i = 0; i < battlesPerScp; i++, n++) {
      const rng = createRng(n)
      const built = randomTeamWith(dex, rng, pool, id)
      const random = randomTeam(dex, rng, pool)
      // Alternate sides so the focused team isn't always side 0.
      const teams: [string[], string[]] = i % 2 === 0 ? [built, random] : [random, built]
      const { state, kos, moves } = playBattle(dex, teams, n, rng)

      result.battles++
      // The AI never forfeits, so an ending with neither team wiped out is a turn-limit ending.
      if (!state.sides.some((sd) => sd.team.every(isNeutralized))) result.timeouts++
      for (const m of moves) result.moveUses[m] = (result.moveUses[m] ?? 0) + 1
      for (const side of [0, 1] as const) {
        const won = state.winner === side ? 1 : 0
        teams[side].forEach((scp, slot) => {
          const t = (result.perScp[scp] ??= { battles: 0, wins: 0, sweeps: 0 })
          t.battles++
          t.wins += won
          if (kos[side][slot] >= Math.ceil(teams[1 - side].length / 2)) t.sweeps++
        })
        const m = (result.perMakeup[makeupOf(dex, teams[side])] ??= {
          battles: 0, wins: 0, sweeps: 0, cost: teamCost(dex, teams[side]),
        })
        m.battles++
        m.wins += won
      }
    }
  }
  return result
}
