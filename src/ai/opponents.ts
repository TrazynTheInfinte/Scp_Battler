/**
 * Single-player opponents ("bots"). All but the Scientist play with the
 * greedy AI in ./index; they differ in how they build teams, what they show,
 * and (for the Reality Bender) how their SCPs work.
 */
import { legalChoices, switchTargets, type BattleState, type Choice, type Dex, type Rng, type SideIndex } from '../engine'
import { randomEquipment, randomTeam } from './index'

export type OpponentKind = 'trainer' | 'scientist' | 'mtf' | 'o5' | 'realityBender'

export interface OpponentInfo {
  kind: OpponentKind
  label: string
  blurb: string
}

/** In difficulty order, easiest first. */
export const OPPONENTS: readonly OpponentInfo[] = [
  { kind: 'scientist', label: 'Scientist', blurb: 'Picks moves at random.' },
  { kind: 'trainer', label: 'Trainer', blurb: 'Plays like a Mobile Task Force, but shows you its next move.' },
  { kind: 'mtf', label: 'Mobile Task Force', blurb: 'The standard opponent.' },
  { kind: 'o5', label: 'O5 Council Member', blurb: 'Plays like a Mobile Task Force, with the statistically strongest teams.' },
  {
    kind: 'realityBender',
    label: 'Reality Bender',
    blurb: "Plays like a Mobile Task Force, but its SCPs' stats are flipped and its moves take their counter type.",
  },
]

export const DEFAULT_OPPONENT: OpponentKind = 'mtf'

/** A few well-known Mobile Task Forces from the SCP Wiki. */
export const MTF_NAMES: readonly (readonly [designation: string, nickname: string])[] = [
  ['Alpha-1', 'Red Right Hand'],
  ['Alpha-9', 'Last Hope'],
  ['Beta-7', 'Maz Hatters'],
  ['Epsilon-6', 'Village Idiots'],
  ['Epsilon-11', 'Nine-Tailed Fox'],
  ['Eta-10', 'See No Evil'],
  ['Gamma-5', 'Red Herrings'],
  ['Nu-7', 'Hammer Down'],
  ['Omega-7', "Pandora's Box"],
  ['Tau-5', 'Samsara'],
  ['Zeta-9', 'Mole Rats'],
]

/** One opponent for one match. */
export interface Opponent {
  kind: OpponentKind
  /** Full name, shown as the opponent's name (e.g. "MTF Epsilon-11 'Nine-Tailed Fox'"). */
  name: string
  /** Short name for the battle log (e.g. "Nine-Tailed Fox", as in "Nine-Tailed Fox's SCP-682"). */
  tag: string
}

export function makeOpponent(kind: OpponentKind, rng: Rng): Opponent {
  switch (kind) {
    case 'mtf': {
      const [designation, nickname] = MTF_NAMES[rng.int(0, MTF_NAMES.length - 1)]
      return { kind, name: `MTF ${designation} '${nickname}'`, tag: nickname }
    }
    case 'o5': {
      const n = rng.int(1, 13)
      return { kind, name: `O5-${n}`, tag: `O5-${n}` }
    }
    case 'trainer':
      return { kind, name: 'Trainer', tag: 'Trainer' }
    case 'scientist':
      return { kind, name: 'Scientist', tag: 'Scientist' }
    case 'realityBender':
      return { kind, name: 'Reality Bender', tag: 'Reality Bender' }
  }
}

// ---------------------------------------------------------------------------
// Scientist: random play
// ---------------------------------------------------------------------------

/** A random legal move (never a voluntary switch, unless nothing else is legal). */
export function chooseRandomAction(state: BattleState, side: SideIndex, rng: Rng): Choice {
  const all = legalChoices(state, side)
  const moves = all.filter((c) => c.kind === 'move')
  const pool = moves.length > 0 ? moves : all
  return pool[rng.int(0, pool.length - 1)]
}

/** A random benched SCP to send in. */
export function chooseRandomReplacement(state: BattleState, side: SideIndex, rng: Rng): number {
  const options = switchTargets(state, side)
  if (options.length === 0) throw new Error(`side ${side} has nothing to send in`)
  return options[rng.int(0, options.length - 1)]
}

// ---------------------------------------------------------------------------
// O5 Council Member: statistically strong builds
// ---------------------------------------------------------------------------

/** Win rates from the balance report (src/data/winRates.json): SCP and Equipment id -> share of battles won. */
export interface WinRates {
  scp: Readonly<Record<string, number>>
  equipment: Readonly<Record<string, number>>
}

/** How many random legal teams the O5 considers, and how many of the best it picks between. */
export const STRONG_TEAM_SAMPLES = 2000
export const STRONG_TEAM_TOP = 5
const EQUIPMENT_SAMPLES = 200

/**
 * A legal team with a high total win rate: the best few of many random legal
 * teams, one picked at random so the O5 doesn't always bring the same six.
 */
export function strongTeam(dex: Dex, rng: Rng, pool: readonly string[], rates: WinRates): string[] {
  const score = (team: readonly string[]) => team.reduce((s, id) => s + (rates.scp[id] ?? 0.5), 0)
  const seen = new Set<string>()
  const best: { team: string[]; score: number }[] = []
  for (let i = 0; i < STRONG_TEAM_SAMPLES; i++) {
    const team = randomTeam(dex, rng, pool)
    const key = [...team].sort().join(',')
    if (seen.has(key)) continue
    seen.add(key)
    best.push({ team, score: score(team) })
    best.sort((a, b) => b.score - a.score)
    if (best.length > STRONG_TEAM_TOP) best.pop()
  }
  return best[rng.int(0, best.length - 1)].team
}

/** Equipment for `team` that only carries pieces that win more than they lose, as much of it as fits. */
export function strongEquipment(dex: Dex, rng: Rng, team: readonly string[], rates: WinRates): (string | null)[] {
  const value = (set: readonly (string | null)[]) =>
    set.reduce((s, id) => s + (id === null ? 0 : (rates.equipment[id] ?? 0.5) - 0.5), 0)
  let best: (string | null)[] = team.map(() => null)
  let bestValue = 0
  for (let i = 0; i < EQUIPMENT_SAMPLES; i++) {
    const set = randomEquipment(dex, rng, team)
    const v = value(set)
    if (v > bestValue) {
      best = set
      bestValue = v
    }
  }
  return best
}
