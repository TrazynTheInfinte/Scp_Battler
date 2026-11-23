import type { AbilityData, AbilityRule } from '../engine'

/**
 * Rule kinds that counter something the opponent does (its boosts, stat
 * drops, statuses, or priority). Every Thaumiel SCP's ability must include
 * at least one; add new counter kinds here as they're created.
 */
export const COUNTER_RULE_KINDS: ReadonlySet<AbilityRule['kind']> = new Set([
  'blockStatDrops',
  'statusImmunity',
  'watcher',
  'clearOpponentBoostsOnEntry',
])

/**
 * Every ability, as data. Each is a list of rules the engine implements
 * (see AbilityRule); several SCPs may share one ability. Only a genuinely new
 * kind of rule needs engine code.
 */
const ABILITY_LIST: AbilityData[] = [
  {
    id: 'unobserved',
    name: 'Unobserved',
    description:
      "Always moves first, unless it has a status condition, or the opponent used a Status move last turn and is watching it. Can't attack an Ever Watchful opponent.",
    rules: [{ kind: 'unobserved' }],
  },
  {
    id: 'adaptive',
    name: 'Adaptive',
    description:
      'After taking damage from a move, takes 25% less damage from that type until it switches out. Remembers only the latest type.',
    rules: [{ kind: 'adaptive', multiplier: 0.75 }],
  },
  {
    id: 'jovial',
    name: 'Jovial',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'precisionEngineering',
    name: 'Precision Engineering',
    description: "Opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'willingDetainee',
    name: 'Willing Detainee',
    description: "Can't be Contained.",
    rules: [{ kind: 'statusImmunity', statuses: ['Contained'] }],
  },
  {
    id: 'everWatchful',
    name: 'Ever Watchful',
    description:
      "The opponent's Unobserved never triggers, and an SCP with Unobserved can't use attacking moves while facing it.",
    rules: [{ kind: 'watcher' }],
  },
  {
    id: 'enraged',
    name: 'Enraged',
    description: 'Raises its Attack by 1 when it takes damage from a move, up to twice each time it enters the field.',
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 2 }],
  },
  {
    id: 'theCure',
    name: 'The Cure',
    description: 'Deals 1.5x damage to targets that have a status condition.',
    rules: [{ kind: 'damageDealtVsStatused', multiplier: 1.5 }],
  },
  {
    id: 'bootSequence',
    name: 'Boot Sequence',
    description: 'Raises its Sp. Attack by 1 when it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spa: 1 } }],
  },
  {
    id: 'morbidAllure',
    name: 'Morbid Allure',
    description: 'An SCP that hits it with a Physical move has a 30% chance to start Bleeding.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'phasing',
    name: 'Phasing',
    description: 'Takes half damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.5 }],
  },
  {
    id: 'selfKeepingSecret',
    name: 'Self-Keeping Secret',
    description: 'When it enters the field, the opponent forgets its stat boosts.',
    rules: [{ kind: 'clearOpponentBoostsOnEntry' }],
  },

  // --- wave 2 ---
  {
    id: 'guardianOfTheGate',
    name: 'Guardian of the Gate',
    description: 'Any SCP that damages it with a move loses 1/8 of its own max HP.',
    rules: [{ kind: 'retaliate', fraction: 1 / 8 }],
  },
  {
    id: 'provoked',
    name: 'Provoked',
    description: 'Raises its Attack by 1 the first time it takes damage from a move each time it enters the field.',
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'contagious',
    name: 'Contagious',
    description: 'An SCP that hits it with a Physical move has a 30% chance to start Bleeding.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'psychoticAura',
    name: 'Psychotic Aura',
    description: 'The opponent loses 1/16 of its max HP at the end of each turn.',
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'loadedChamber',
    name: 'Loaded Chamber',
    description: 'Raises its Sp. Attack by 1 when it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spa: 1 } }],
  },
  {
    id: 'y909',
    name: 'Y-909',
    description: 'When it enters the field, the opponent forgets its stat boosts.',
    rules: [{ kind: 'clearOpponentBoostsOnEntry' }],
  },
  {
    id: 'centerOfEverything',
    name: 'Center of Everything',
    description: "The story can't be undone: opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'failsafe',
    name: 'Failsafe',
    description: "Opponents can't lower its stats, and it can't become Amnesiac.",
    rules: [{ kind: 'blockStatDrops' }, { kind: 'statusImmunity', statuses: ['Amnesiac'] }],
  },
  {
    id: 'undying',
    name: 'Undying',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'agitated',
    name: 'Agitated',
    description: 'Raises its Speed by 1 when it takes damage from a move, up to twice each time it enters the field.',
    rules: [{ kind: 'boostWhenHit', changes: { spe: 1 }, maxPerEntry: 2 }],
  },
  {
    id: 'outOfReach',
    name: 'Out of Reach',
    description: 'Takes half damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.5 }],
  },
  {
    id: 'stuffed',
    name: 'Stuffed',
    description: "Can't Bleed.",
    rules: [{ kind: 'statusImmunity', statuses: ['Bleeding'] }],
  },
]

export const ABILITIES: Readonly<Record<string, AbilityData>> = Object.fromEntries(
  ABILITY_LIST.map((a) => [a.id, a]),
)
