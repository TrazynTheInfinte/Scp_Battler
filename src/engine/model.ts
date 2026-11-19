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

export interface MoveData {
  id: string
  name: string
  type: TypeName
  category: MoveCategory
  /** 0 for Status moves. */
  power: number
  /** Percent chance to hit (0-100); null means the move never misses. */
  accuracy: number | null
}

export interface SpeciesData {
  id: string
  name: string
  objectClass: ObjectClass
  types: readonly [TypeName] | readonly [TypeName, TypeName]
  baseStats: Stats
  /** Exactly four move ids. */
  moves: readonly [string, string, string, string]
}

export interface Dex {
  species: Readonly<Record<string, SpeciesData>>
  moves: Readonly<Record<string, MoveData>>
}

// ---------------------------------------------------------------------------
// Battle state. Plain, serializable data — no classes, no functions.
// ---------------------------------------------------------------------------

export type SideIndex = 0 | 1

export interface Combatant {
  speciesId: string
  /** Current HP; 0 means Neutralized. */
  hp: number
  /** Calculated (level-applied) stats. */
  stats: Stats
  stages: StatStages
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
// ---------------------------------------------------------------------------

export type BattleEvent =
  | { type: 'switch'; side: SideIndex; from: number; to: number }
  | { type: 'replace'; side: SideIndex; to: number }
  | { type: 'move'; side: SideIndex; moveId: string }
  | { type: 'miss'; side: SideIndex }
  | { type: 'noEffect'; side: SideIndex }
  | {
      type: 'damage'
      /** The side that took the damage. */
      side: SideIndex
      amount: number
      hpAfter: number
      effectiveness: number
      crit: boolean
    }
  | { type: 'neutralized'; side: SideIndex; teamIndex: number }
  | { type: 'forfeit'; side: SideIndex }
  | { type: 'end'; winner: SideIndex | 'draw' }
