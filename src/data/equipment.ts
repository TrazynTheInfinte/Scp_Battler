import type { EquipmentData } from '../engine'

/**
 * Every piece of Equipment, as data. Each is built from the same rules as
 * abilities (see AbilityRule), costs 1-2 points, and may appear at most once
 * per team. Costs and effects are balance-checked like SCPs (docs/adr/0003).
 */
const EQUIPMENT_LIST: EquipmentData[] = [
  {
    id: 'medkit',
    name: 'Medkit',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    cost: 1,
    rules: [{ kind: 'healEachTurn', fraction: 1 / 16 }],
  },
  {
    id: 'riotShield',
    name: 'Riot Shield',
    description: 'Defense +1 whenever it enters the field.',
    cost: 1,
    rules: [{ kind: 'boostOnEntry', changes: { def: 1 } }],
  },
  {
    id: 'combatStimulant',
    name: 'Combat Stimulant',
    description: 'Speed +1 whenever it enters the field.',
    cost: 1,
    rules: [{ kind: 'boostOnEntry', changes: { spe: 1 } }],
  },
  {
    id: 'hazmatSuit',
    name: 'Hazmat Suit',
    description: "Can't be made to Bleed.",
    cost: 1,
    rules: [{ kind: 'statusImmunity', statuses: ['Bleeding'] }],
  },
  {
    id: 'amnesticInhaler',
    name: 'Amnestic Inhaler',
    description: "Can't become Amnesiac.",
    cost: 1,
    rules: [{ kind: 'statusImmunity', statuses: ['Amnesiac'] }],
  },
  {
    id: 'hollowPointRounds',
    name: 'Hollow-Point Rounds',
    description: 'Deals 20% more damage to targets with a status condition.',
    cost: 2,
    rules: [{ kind: 'damageDealtVsStatused', multiplier: 1.2 }],
  },
  {
    id: 'reactivePlating',
    name: 'Reactive Plating',
    description: 'An attacker that damages it with a move loses 1/8 of its own max HP.',
    cost: 2,
    rules: [{ kind: 'retaliate', fraction: 1 / 8 }],
  },
  {
    id: 'ammoPouch',
    name: 'Ammo Pouch',
    description: 'Each of its moves has 50% more PP.',
    cost: 1,
    rules: [{ kind: 'extraPp', fraction: 0.5 }],
  },
]

export const EQUIPMENT: Readonly<Record<string, EquipmentData>> = Object.fromEntries(
  EQUIPMENT_LIST.map((e) => [e.id, e]),
)

/** Equipment ids in display order: cheapest first, then as listed. */
export const EQUIPMENT_ORDER: readonly string[] = [...EQUIPMENT_LIST]
  .sort((a, b) => a.cost - b.cost)
  .map((e) => e.id)
