import type { TypeName } from './typeChart'

// ---------------------------------------------------------------------------
// Static data (the roster). Supplied to the engine as a Dex.
// ---------------------------------------------------------------------------

export type ObjectClass = 'Safe' | 'Euclid' | 'Keter'

export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'
export type Stats = Record<StatName, number>

/** Stats that can carry stat stages (no accuracy/evasion stages by design). */
export type StageableStat = Exclude<StatName, 'hp'>
export type StatStages = Record<StageableStat, number>

export type MoveCategory = 'Physical' | 'Special' | 'Status'

export type StatusName = 'Bleeding' | 'Stunned' | 'Amnesiac' | 'Contained'

/**
 * Extra effects a move can carry. On a damaging move they apply only if it
 * hits and the target is not Neutralized. `chance` is a percent (0-100).
 */
export type MoveEffect =
  /** Inflict a status condition on the target. */
  | { kind: 'status'; status: StatusName; chance: number }
  /** Raise/lower stat stages on the user or the target. */
  | {
      kind: 'stages'
      who: 'user' | 'target'
      changes: Partial<StatStages>
      chance: number
    }
  /** The user recovers a percent of its max HP. */
  | { kind: 'heal'; percent: number }
  /** Remove the user's status condition. */
  | { kind: 'cure' }

export interface MoveData {
  id: string
  name: string
  type: TypeName
  category: MoveCategory
  /** 0 for Status moves. */
  power: number
  /** Percent chance to hit (0-100); null means the move never misses. */
  accuracy: number | null
  effects?: readonly MoveEffect[]
}

export interface SpeciesData {
  id: string
  name: string
  objectClass: ObjectClass
  types: readonly [TypeName] | readonly [TypeName, TypeName]
  baseStats: Stats
  /** Exactly four move ids. */
  moves: readonly [string, string, string, string]
  /** Id of an ability in the engine's ability registry. */
  ability?: string
}

export interface Dex {
  species: Readonly<Record<string, SpeciesData>>
  moves: Readonly<Record<string, MoveData>>
}

// ---------------------------------------------------------------------------
// Battle state. Plain, serializable data — no classes, no functions.
// ---------------------------------------------------------------------------

export type SideIndex = 0 | 1

export interface StatusState {
  name: StatusName
  /** Remaining count for timed statuses (Amnesiac, Contained); null = until cured. */
  turnsLeft: number | null
}

/** Short-term battle memory, wiped whenever the SCP switches in or out. */
export interface Volatiles {
  /** Adaptive: the move type this SCP currently takes half damage from. */
  adaptedType: TypeName | null
  /** True if the opposing active used a Status move last turn ("watched"). */
  watched: boolean
}

export interface Combatant {
  speciesId: string
  /** Current HP; 0 means Neutralized. */
  hp: number
  /** Calculated (level-applied) stats. */
  stats: Stats
  stages: StatStages
  /** At most one status condition. Persists through switching. */
  status: StatusState | null
  volatiles: Volatiles
}

export interface SideState {
  team: Combatant[]
  /** Index into `team` of the active SCP. */
  active: number
}

export type BattlePhase = 'choose' | 'replace' | 'ended'

export interface BattleState {
  level: number
  /** 1-based number of the turn currently being chosen. */
  turn: number
  phase: BattlePhase
  sides: [SideState, SideState]
  /** During 'replace': which sides must send in a new active. */
  needsReplacement: [boolean, boolean]
  winner: SideIndex | 'draw' | null
  rngState: number
}

/** What a side decides to do on a turn. */
export type Choice =
  | { kind: 'move'; moveIndex: number }
  | { kind: 'switch'; teamIndex: number }

// ---------------------------------------------------------------------------
// Events: what happened during a resolution step, in order, for the UI log.
// `side` is always the side the event happened to.
// ---------------------------------------------------------------------------

export type BattleEvent =
  | { type: 'switch'; side: SideIndex; from: number; to: number }
  | { type: 'replace'; side: SideIndex; to: number }
  /** Stunned: lost the turn. */
  | { type: 'stunned'; side: SideIndex }
  /** Amnesiac: the move about to be used was picked at random. */
  | { type: 'amnesia'; side: SideIndex }
  | { type: 'move'; side: SideIndex; moveId: string }
  | { type: 'miss'; side: SideIndex }
  /** A Status move that changed nothing. */
  | { type: 'noEffect'; side: SideIndex }
  | {
      type: 'damage'
      side: SideIndex
      amount: number
      hpAfter: number
      effectiveness: number
      crit: boolean
    }
  /** End-of-turn status damage (Bleeding / Contained). */
  | { type: 'residual'; side: SideIndex; status: StatusName; amount: number; hpAfter: number }
  | { type: 'heal'; side: SideIndex; amount: number; hpAfter: number }
  | { type: 'stage'; side: SideIndex; stat: StageableStat; delta: number }
  | { type: 'status'; side: SideIndex; status: StatusName }
  /** A status was cured or wore off. */
  | { type: 'statusEnded'; side: SideIndex; status: StatusName }
  /** An ability visibly triggered. */
  | { type: 'ability'; side: SideIndex; abilityId: string; typeName?: TypeName }
  | { type: 'neutralized'; side: SideIndex; teamIndex: number }
  | { type: 'forfeit'; side: SideIndex }
  /** The turn limit was reached; the following 'end' is decided by remaining HP. */
  | { type: 'timeout' }
  | { type: 'end'; winner: SideIndex | 'draw' }
