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
  // wave 3
  {
    id: 'unseenAssailant',
    name: 'Unseen Assailant',
    description: 'Attack +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { atk: 1 } }],
  },
  {
    id: 'spreadingFreeze',
    name: 'Spreading Freeze',
    description: 'An attacker that hits it with a Physical move has a 30% chance to Bleed.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'teratomorphosis',
    name: 'Teratomorphosis',
    description: 'The first time a move hits it after it enters the field: Attack +1 and Defense +1.',
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1, def: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'shroud',
    name: 'Shroud',
    description: 'Takes 25% less damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'superelastic',
    name: 'Superelastic',
    description: 'Speed +1 each time a move hits it (at most twice each time it enters the field).',
    rules: [{ kind: 'boostWhenHit', changes: { spe: 1 }, maxPerEntry: 2 }],
  },
  {
    id: 'endlessBrood',
    name: 'Endless Brood',
    description: 'An attacker that damages it with a move loses 1/16 of its own max HP.',
    rules: [{ kind: 'retaliate', fraction: 1 / 16 }],
  },
  {
    id: 'deathOmen',
    name: 'Death Omen',
    description: 'At the end of each turn, the opponent loses 1/16 of its max HP.',
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'verminSwarm',
    name: 'Vermin Swarm',
    description: 'An attacker that hits it with a Physical move has a 30% chance to Bleed.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'loyalCreations',
    name: 'Loyal Creations',
    description: 'Takes 25% less damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'euphoricTouch',
    name: 'Euphoric Touch',
    description: 'An attacker that hits it with a Physical move has a 30% chance to be Stunned.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Stunned', chance: 30 }],
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'An attacker that damages it with a move loses 1/8 of its own max HP. Heals 1/16 of its max HP each turn.',
    rules: [{ kind: 'retaliate', fraction: 1 / 8 }, { kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'formless',
    name: 'Formless',
    description: 'Takes 25% less damage from Special moves.',
    rules: [{ kind: 'damageTaken', category: 'Special', multiplier: 0.75 }],
  },
  {
    id: 'tacticalTraining',
    name: 'Tactical Training',
    description: "Opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'expendable',
    name: 'Expendable',
    description: 'The first time a move hits it after it enters the field: Attack +1.',
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'wayWalker',
    name: 'Way-Walker',
    description: 'Speed +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spe: 1 } }],
  },
  // wave 4
  {
    id: 'fascination',
    name: 'Fascination',
    description: 'An attacker that hits it with a Physical move has a 30% chance to be Stunned.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Stunned', chance: 30 }],
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: 'Takes 25% less damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'burningBody',
    name: 'Burning Body',
    description: 'An attacker that hits it with a Physical move has a 30% chance to Bleed.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'constantRefrain',
    name: 'Constant Refrain',
    description: 'Sp. Attack +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spa: 1 } }],
  },
  {
    id: 'selfReplicating',
    name: 'Self-Replicating',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'barbedChains',
    name: 'Barbed Chains',
    description: 'An attacker that damages it with a move loses 1/16 of its own max HP.',
    rules: [{ kind: 'retaliate', fraction: 1 / 16 }],
  },
  {
    id: 'sleepersPrey',
    name: "Sleeper's Prey",
    description: 'Deals 1.5x damage to targets that have a status condition.',
    rules: [{ kind: 'damageDealtVsStatused', multiplier: 1.5 }],
  },
  {
    id: 'markOfCain',
    name: 'Mark of Cain',
    description: 'An attacker that damages it with a move loses 1/8 of its own max HP.',
    rules: [{ kind: 'retaliate', fraction: 1 / 8 }],
  },
  {
    id: 'leapingPredator',
    name: 'Leaping Predator',
    description: 'Speed +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spe: 1 } }],
  },
  {
    id: 'miasma',
    name: 'Miasma',
    description: 'At the end of each turn, the opponent loses 1/16 of its max HP.',
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'thickHide',
    name: 'Thick Hide',
    description: 'Takes 25% less damage from Physical moves.',
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'hibernation',
    name: 'Hibernation',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  // wave 5
  {
    id: 'nightmares',
    name: 'Nightmares',
    description: 'At the end of each turn, the opponent loses 1/16 of its max HP.',
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description: "Nothing slows it down: opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'packHunter',
    name: 'Pack Hunter',
    description: 'Speed +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spe: 1 } }],
  },
  {
    id: 'guardConstructs',
    name: 'Guard Constructs',
    description: 'An attacker that damages it with a move loses 1/16 of its own max HP.',
    rules: [{ kind: 'retaliate', fraction: 1 / 16 }],
  },
  {
    id: 'toothedMaw',
    name: 'Toothed Maw',
    description: 'An attacker that hits it with a Physical move has a 30% chance to Bleed.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'stressed',
    name: 'Stressed',
    description: 'The first time a move hits it after it enters the field: Sp. Attack +1.',
    rules: [{ kind: 'boostWhenHit', changes: { spa: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'searingTouch',
    name: 'Searing Touch',
    description: 'An attacker that hits it with a Physical move has a 30% chance to Bleed.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'eyeOfTheStorm',
    name: 'Eye of the Storm',
    description: 'Takes 15% less damage from Physical and Special moves.',
    rules: [
      { kind: 'damageTaken', category: 'Physical', multiplier: 0.85 },
      { kind: 'damageTaken', category: 'Special', multiplier: 0.85 },
    ],
  },
  {
    id: 'accretion',
    name: 'Accretion',
    description: 'Defense +1 each time a move hits it (at most twice each time it enters the field).',
    rules: [{ kind: 'boostWhenHit', changes: { def: 1 }, maxPerEntry: 2 }],
  },
  {
    id: 'blindingContagion',
    name: 'Blinding Contagion',
    description: 'An attacker that hits it with a Physical move has a 30% chance to become Amnesiac.',
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Amnesiac', chance: 30 }],
  },
  {
    id: 'regrowingMagazine',
    name: 'Regrowing Magazine',
    description: 'Each of its moves has 50% more PP.',
    rules: [{ kind: 'extraPp', fraction: 0.5 }],
  },
  // SCP-970 (Friend's Pick)
  {
    id: 'randomManifestation',
    name: 'Random Manifestation',
    description: 'At the end of each turn, a 10% chance it slips into another iteration: it withdraws, and you choose who comes in.',
    rules: [{ kind: 'randomWithdraw', chance: 10 }],
  },
  {
    id: 'holeForMomentum',
    name: 'Hole for Momentum',
    description: 'Speed +1 whenever it enters the field.',
    rules: [{ kind: 'boostOnEntry', changes: { spe: 1 } }],
  },
  // wave 6
  {
    id: 'fungalBloom',
    name: "Fungal Bloom",
    description: "At the end of each turn, the opponent loses 1/16 of its max HP.",
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'breakingAndEntering',
    name: "Breaking and Entering",
    description: "When it enters the field, the opponent forgets its stat boosts.",
    rules: [{ kind: 'clearOpponentBoostsOnEntry' }],
  },
  {
    id: 'malignantAura',
    name: "Malignant Aura",
    description: "An attacker that hits it with a Physical move has a 30% chance to Bleed.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'makeBelieve',
    name: "Make-Believe",
    description: "The first time a move hits it after it enters the field: Attack +1.",
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'expandingChronicle',
    name: "Expanding Chronicle",
    description: "The first time a move hits it after it enters the field: Sp. Attack +1.",
    rules: [{ kind: 'boostWhenHit', changes: { spa: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'larvalBrood',
    name: "Larval Brood",
    description: "At the end of each turn, the opponent loses 1/16 of its max HP.",
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'hostTakeover',
    name: "Host Takeover",
    description: "Its rebuilt body won't give: opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'camouflaged',
    name: "Camouflaged",
    description: "Attack +1 whenever it enters the field.",
    rules: [{ kind: 'boostOnEntry', changes: { atk: 1 } }],
  },
  {
    id: 'regrowingBones',
    name: "Regrowing Bones",
    description: "Heals 1/16 of its max HP at the end of each turn.",
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'dissolvingColony',
    name: "Dissolving Colony",
    description: "An attacker that hits it with a Physical move has a 30% chance to Bleed.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'airborne',
    name: "Airborne",
    description: "Takes 25% less damage from Physical moves.",
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'fishHooks',
    name: "Fish Hooks",
    description: "An attacker that hits it with a Physical move has a 30% chance to Bleed.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Bleeding', chance: 30 }],
  },
  {
    id: 'alienPhysiology',
    name: "Alien Physiology",
    description: "Opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'hungrySands',
    name: "Hungry Sands",
    description: "A swarm, not a body: takes 25% less damage from Physical moves.",
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'deflection',
    name: "Deflection",
    description: "Takes 25% less damage from Physical moves.",
    rules: [{ kind: 'damageTaken', category: 'Physical', multiplier: 0.75 }],
  },
  {
    id: 'alienHide',
    name: "Alien Hide",
    description: "Takes 15% less damage from Physical and Special moves.",
    rules: [
      { kind: 'damageTaken', category: 'Physical', multiplier: 0.85 },
      { kind: 'damageTaken', category: 'Special', multiplier: 0.85 },
    ],
  },
  {
    id: 'spiteful',
    name: "Spiteful",
    description: "The first time a move hits it after it enters the field: Attack +1.",
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'escapeArtist',
    name: "Escape Artist",
    description: "Can't be Contained.",
    rules: [{ kind: 'statusImmunity', statuses: ['Contained'] }],
  },
  {
    id: 'podHunters',
    name: "Pod Hunters",
    description: "The first time a move hits it after it enters the field: Attack +1.",
    rules: [{ kind: 'boostWhenHit', changes: { atk: 1 }, maxPerEntry: 1 }],
  },
  {
    id: 'radiation',
    name: "Radiation",
    description: "At the end of each turn, the opponent loses 1/16 of its max HP.",
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'fullSteam',
    name: "Full Steam",
    description: "Speed +1 each time a move hits it (at most twice each time it enters the field).",
    rules: [{ kind: 'boostWhenHit', changes: { spe: 1 }, maxPerEntry: 2 }],
  },
  {
    id: 'smokeAndMirrors',
    name: "Smoke and Mirrors",
    description: "An attacker that hits it with a Physical move has a 30% chance to become Amnesiac.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Amnesiac', chance: 30 }],
  },
  {
    id: 'shrapnel',
    name: "Shrapnel",
    description: "An attacker that damages it with a move loses 1/12 of its own max HP.",
    rules: [{ kind: 'retaliate', fraction: 1 / 12 }],
  },
  {
    id: 'badLuck',
    name: "Bad Luck",
    description: "An attacker that damages it with a move loses 1/16 of its own max HP.",
    rules: [{ kind: 'retaliate', fraction: 1 / 16 }],
  },
  // wave 7
  {
    id: 'interchangeableModules',
    name: "Interchangeable Modules",
    description: "Fits its soldier module on the way in: Attack +1 whenever it enters the field.",
    rules: [{ kind: 'boostOnEntry', changes: { atk: 1 } }],
  },
  {
    id: 'devotedHandlers',
    name: "Devoted Handlers",
    description: "Its handlers protect it: an attacker that damages it with a move loses 1/16 of its own max HP.",
    rules: [{ kind: 'retaliate', fraction: 1 / 16 }],
  },
  {
    id: 'sisterOfTheSun',
    name: "Sister of the Sun",
    description: "Its aim is never wrong: its moves never miss, and opponents can't lower its stats.",
    rules: [{ kind: 'neverMisses' }, { kind: 'blockStatDrops' }],
  },
  {
    id: 'endlessHalls',
    name: "Endless Halls",
    description: "When it enters the field, the opponent gets lost in its halls: Speed −1.",
    rules: [{ kind: 'opponentStagesOnEntry', changes: { spe: -1 } }],
  },
  {
    id: 'backwards',
    name: "Backwards",
    description: "Stat drops from the opponent work in reverse and raise its stats instead. Accuracy drops just fail.",
    rules: [{ kind: 'reverseStatDrops' }],
  },
  {
    id: 'deathDrone',
    name: "Death Drone",
    description: "At the end of each turn, the opponent loses 1/16 of its max HP.",
    rules: [{ kind: 'drainOpponentEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'castShadows',
    name: "Cast Shadows",
    description: "When it enters the field, the opponent can't see straight: Accuracy −1.",
    rules: [{ kind: 'opponentStagesOnEntry', changes: { acc: -1 } }],
  },
  {
    id: 'surgicalPrecision',
    name: "Surgical Precision",
    description: "Deals 1.5x damage to targets that have a status condition.",
    rules: [{ kind: 'damageDealtVsStatused', multiplier: 1.5 }],
  },
  {
    id: 'clockworkInfection',
    name: "Clockwork Infection",
    description: "An attacker that hits it with a Physical move has a 30% chance to be Stunned.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Stunned', chance: 30 }],
  },
  {
    id: 'paralyticMucus',
    name: "Paralytic Mucus",
    description: "An attacker that hits it with a Physical move has a 30% chance to be Stunned.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Stunned', chance: 30 }],
  },
  {
    id: 'unstoppable',
    name: "Unstoppable",
    description: "Nothing moves it or slows it down: opponents can't lower its stats.",
    rules: [{ kind: 'blockStatDrops' }],
  },
  {
    id: 'neuralGrowth',
    name: "Neural Growth",
    description: "An attacker that hits it with a Physical move has a 30% chance to become Amnesiac.",
    rules: [{ kind: 'afflictAttacker', category: 'Physical', status: 'Amnesiac', chance: 30 }],
  },
]

export const ABILITIES: Readonly<Record<string, AbilityData>> = Object.fromEntries(
  ABILITY_LIST.map((a) => [a.id, a]),
)
