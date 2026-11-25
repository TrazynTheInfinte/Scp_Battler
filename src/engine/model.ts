import type { TypeName } from './typeChart'

// ---------------------------------------------------------------------------
// Static data (the roster). Supplied to the engine as a Dex.
// ---------------------------------------------------------------------------

export type ObjectClass = 'Safe' | 'Euclid' | 'Keter' | 'Thaumiel' | 'Apollyon'

export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'
export type Stats = Record<StatName, number>

/** Stats that can carry stat stages. */
export type StageableStat = Exclude<StatName, 'hp'>
/**
 * Everything that carries a stage: the five stats plus accuracy. Accuracy only
 * goes down (to ACC_MIN_STAGE) and only affects moves with an accuracy number;
 * moves that never miss ignore it. There are no evasion stages.
 */
export type StageName = StageableStat | 'acc'
export type StatStages = Record<StageName, number>

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
  /** Clear the user's status condition and every stat stage, up or down. */
  | { kind: 'resetSelf' }
  /** The user withdraws at the end of the turn, and its side chooses who comes in (see Volatiles.withdrawing). */
  | { kind: 'withdraw' }

export interface MoveData {
  id: string
  name: string
  type: TypeName
  category: MoveCategory
  /** 0 for Status moves. */
  power: number
  /** Percent chance to hit (0-100); null means the move never misses. */
  accuracy: number | null
  /** Power Points: how many times the move can be used in one battle. */
  pp: number
  /** Ignores types: always x1 effectiveness and never same-type boosted (Struggle). */
  typeless?: boolean
  effects?: readonly MoveEffect[]
}

/**
 * One reusable building block of an ability. The engine implements each kind;
 * an ability is a list of rules, so most new abilities are pure data.
 * Chances are percents (0-100).
 */
export type AbilityRule =
  /** Heals `fraction` of max HP at end of turn when hurt. */
  | { kind: 'healEachTurn'; fraction: number }
  /** Opponents can't lower its stat stages. */
  | { kind: 'blockStatDrops' }
  /** Can never receive these statuses. */
  | { kind: 'statusImmunity'; statuses: readonly StatusName[] }
  /** Watches the opponent: cancels its priority, and freezes `unobserved` attackers. */
  | { kind: 'watcher' }
  /** Moves first unless statused or watched last turn; can't attack a watcher. */
  | { kind: 'unobserved' }
  /** After a damaging hit, takes `multiplier` damage from that move's type until it leaves. */
  | { kind: 'adaptive'; multiplier: number }
  /** After surviving a damaging hit, applies `changes`, at most `maxPerEntry` times per entry. */
  | { kind: 'boostWhenHit'; changes: Partial<StatStages>; maxPerEntry: number }
  /** Applies `changes` to itself whenever it enters the field. */
  | { kind: 'boostOnEntry'; changes: Partial<StatStages> }
  /** Deals `multiplier` damage to targets that have a status condition. */
  | { kind: 'damageDealtVsStatused'; multiplier: number }
  /** Takes `multiplier` damage from moves of `category`. */
  | { kind: 'damageTaken'; category: MoveCategory; multiplier: number }
  /** An attacker that hits it with a `category` move has `chance`% to receive `status`. */
  | { kind: 'afflictAttacker'; category: MoveCategory; status: StatusName; chance: number }
  /** When it enters the field, the opponent loses its stat boosts (not its drops). */
  | { kind: 'clearOpponentBoostsOnEntry' }
  /** An attacker that damages it with a move loses `fraction` of its own max HP. */
  | { kind: 'retaliate'; fraction: number }
  /** At end of turn, the opponent loses `fraction` of its max HP. */
  | { kind: 'drainOpponentEachTurn'; fraction: number }
  /** Each of its moves gets `fraction` more PP (rounded down). */
  | { kind: 'extraPp'; fraction: number }
  /** At end of turn, `chance`% to withdraw (as the 'withdraw' move effect does). */
  | { kind: 'randomWithdraw'; chance: number }
  /** Stat drops the opponent causes become boosts of the same size (accuracy drops just fail). */
  | { kind: 'reverseStatDrops' }
  /** Whenever it enters the field, applies `changes` to the opponent (blockable like any opponent drop). */
  | { kind: 'opponentStagesOnEntry'; changes: Partial<StatStages> }
  /** Its moves never miss, whatever their accuracy or its accuracy stage. */
  | { kind: 'neverMisses' }

export interface AbilityData {
  id: string
  name: string
  description: string
  rules: readonly AbilityRule[]
}

/**
 * A piece of Equipment (see GLOSSARY.md): an object an SCP carries into
 * battle. Built from the same rules as abilities; costs Team Budget points.
 */
export interface EquipmentData {
  id: string
  name: string
  description: string
  cost: number
  rules: readonly AbilityRule[]
}

export interface SpeciesData {
  id: string
  name: string
  objectClass: ObjectClass
  types: readonly [TypeName] | readonly [TypeName, TypeName]
  baseStats: Stats
  /** Exactly four move ids. */
  moves: readonly [string, string, string, string]
  /** Id of an ability in the Dex. */
  ability?: string
}

export interface Dex {
  species: Readonly<Record<string, SpeciesData>>
  moves: Readonly<Record<string, MoveData>>
  abilities: Readonly<Record<string, AbilityData>>
  equipment: Readonly<Record<string, EquipmentData>>
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
  /**
   * The turn this SCP entered the field: the turn number during which it
   * switched in, or the upcoming turn for a replacement. 0 for a lead.
   */
  enteredTurn: number
  /** boostWhenHit: boosts gained since entering (capped, so it can't snowball forever). */
  hitBoosts: number
  /**
   * Leaves the field at the end of this turn: its side then picks a
   * replacement, the same way as after a Neutralization, but it stays healthy
   * on the bench. Set by the 'withdraw' move effect or 'randomWithdraw' rule.
   */
  withdrawing: boolean
}

export interface Combatant {
  speciesId: string
  /** Id of the Equipment it carries, if any. */
  equipment: string | null
  /** Current HP; 0 means Neutralized. */
  hp: number
  /** Calculated (level-applied) stats. */
  stats: Stats
  stages: StatStages
  /** PP left for each of its four moves, in move order. Persists through switching. */
  pp: number[]
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
  /** Damage dealt by an ability (e.g. retaliation), to `side`. */
  | { type: 'abilityDamage'; side: SideIndex; amount: number; hpAfter: number }
  /** Struggle's recoil damage to the user. */
  | { type: 'recoil'; side: SideIndex; amount: number; hpAfter: number }
  /** Tried to attack while frozen by a watcher (Unobserved vs Ever Watchful): the attack fails. */
  | { type: 'frozen'; side: SideIndex }
  | { type: 'stage'; side: SideIndex; stat: StageName; delta: number }
  | { type: 'status'; side: SideIndex; status: StatusName }
  /** A status was cured or wore off. */
  | { type: 'statusEnded'; side: SideIndex; status: StatusName }
  /** An ability visibly triggered. */
  | { type: 'ability'; side: SideIndex; abilityId: string; typeName?: TypeName }
  /** A piece of Equipment visibly triggered. */
  | { type: 'equipment'; side: SideIndex; equipmentId: string }
  | { type: 'neutralized'; side: SideIndex; teamIndex: number }
  | { type: 'forfeit'; side: SideIndex }
  /** Will leave the field at the end of the turn (its side then picks a replacement). */
  | { type: 'withdraw'; side: SideIndex }
  /** The turn limit was reached; the following 'end' is decided by remaining HP. */
  | { type: 'timeout' }
  | { type: 'end'; winner: SideIndex | 'draw' }
