import type { AbilityData, Dex, MoveData, ObjectClass, SpeciesData, Stats } from '../model'
import type { TypeName } from '../typeChart'

/**
 * A tiny test-only Dex. Level-50 stats are base+5 (base+60 for HP).
 *
 * All fixture species share the same four Kinetic moves:
 *   0 smash  — 250 power, never misses (KOs anything in these fixtures)
 *   1 jab    — 20 power, never misses (never KOs from full HP)
 *   2 whiff  — 0% accuracy (always misses)
 *   3 focus  — Status move
 *
 * Every fixture move has FIXTURE_PP PP (plenty); PP tests set a combatant's
 * `pp` directly.
 */
export const FIXTURE_PP = 64

const moveList: Record<string, Omit<MoveData, 'pp'>> = {
  smash: { id: 'smash', name: 'Smash', type: 'Kinetic', category: 'Physical', power: 250, accuracy: null },
  jab: { id: 'jab', name: 'Jab', type: 'Kinetic', category: 'Physical', power: 20, accuracy: null },
  whiff: { id: 'whiff', name: 'Whiff', type: 'Kinetic', category: 'Physical', power: 40, accuracy: 0 },
  focus: { id: 'focus', name: 'Focus', type: 'Kinetic', category: 'Status', power: 0, accuracy: null },

  // Status-inflicting Status moves (hexer).
  bleed: statusMove('bleed', 'Biological', [{ kind: 'status', status: 'Bleeding', chance: 100 }]),
  stun: statusMove('stun', 'Kinetic', [{ kind: 'status', status: 'Stunned', chance: 100 }]),
  forget: statusMove('forget', 'Antimemetic', [{ kind: 'status', status: 'Amnesiac', chance: 100 }]),
  trap: statusMove('trap', 'Thaumic', [{ kind: 'status', status: 'Contained', chance: 100 }]),

  // Self-targeting / secondary-effect moves (medic, eraser).
  rally: statusMove('rally', 'Kinetic', [{ kind: 'stages', who: 'user', changes: { atk: 2 }, chance: 100 }]),
  mend: statusMove('mend', 'Biological', [{ kind: 'heal', percent: 50 }, { kind: 'cure' }]),
  gash: {
    id: 'gash', name: 'Gash', type: 'Kinetic', category: 'Physical', power: 20, accuracy: null,
    effects: [
      { kind: 'status', status: 'Bleeding', chance: 100 },
      { kind: 'stages', who: 'target', changes: { def: -1 }, chance: 100 },
    ],
  },
  graze: {
    id: 'graze', name: 'Graze', type: 'Kinetic', category: 'Physical', power: 20, accuracy: null,
    effects: [{ kind: 'status', status: 'Stunned', chance: 30 }],
  },
  zap: { id: 'zap', name: 'Zap', type: 'Mechanical', category: 'Special', power: 20, accuracy: null },
}

const moves: Record<string, MoveData> = Object.fromEntries(
  Object.entries(moveList).map(([id, m]) => [id, { ...m, pp: FIXTURE_PP }]),
)

function statusMove(id: string, type: TypeName, effects: MoveData['effects']): Omit<MoveData, 'pp'> {
  return { id, name: id, type, category: 'Status', power: 0, accuracy: null, effects }
}

type Moveset = SpeciesData['moves']
const STANDARD: Moveset = ['smash', 'jab', 'whiff', 'focus']

function sp(
  id: string,
  objectClass: ObjectClass,
  types: SpeciesData['types'],
  base: Stats,
  moveset: Moveset = STANDARD,
  ability?: string,
): SpeciesData {
  return { id, name: id, objectClass, types, baseStats: base, moves: moveset, ability }
}

const stats = (hp: number, atk: number, def: number, spa: number, spd: number, spe: number): Stats => ({
  hp, atk, def, spa, spd, spe,
})

const kinetic: [TypeName] = ['Kinetic']

export const SMASH = 0
export const JAB = 1
export const WHIFF = 2
export const FOCUS = 3

/** Adaptive's damage multiplier in the fixture Dex. */
export const ADAPTIVE_MULTIPLIER = 0.75

const abilities: Record<string, AbilityData> = {
  unobserved: { id: 'unobserved', name: 'Unobserved', description: 'Moves first.', rules: [{ kind: 'unobserved' }] },
  adaptive: {
    id: 'adaptive', name: 'Adaptive', description: 'Adapts.',
    rules: [{ kind: 'adaptive', multiplier: ADAPTIVE_MULTIPLIER }],
  },
}

export const dex: Dex = {
  moves,
  abilities,
  species: {
    fast: sp('fast', 'Euclid', kinetic, stats(80, 120, 80, 80, 80, 130)),
    twin: sp('twin', 'Euclid', kinetic, stats(80, 120, 80, 80, 80, 130)), // same Speed as fast
    slow: sp('slow', 'Safe', ['Biological'], stats(60, 60, 60, 60, 60, 30)),
    warder: sp('warder', 'Safe', ['Thaumic'], stats(100, 60, 100, 60, 100, 40)), // resists Kinetic
    gear: sp('gear', 'Safe', ['Mechanical'], stats(70, 70, 70, 70, 70, 50)),
    keterA: sp('keterA', 'Keter', ['Reality'], stats(100, 100, 100, 100, 100, 100)),
    keterB: sp('keterB', 'Keter', ['Temporal', 'Thaumic'], stats(100, 100, 100, 100, 100, 100)),
    thaumiel: sp('thaumiel', 'Thaumiel', ['Reality'], stats(90, 90, 90, 90, 90, 100)),
    apollyon: sp('apollyon', 'Apollyon', ['Thaumic'], stats(120, 120, 110, 120, 110, 120)),

    // Milestone 3: statuses, effects, abilities.
    hexer: sp('hexer', 'Safe', ['Thaumic'], stats(100, 50, 100, 50, 100, 200), ['bleed', 'stun', 'forget', 'trap']),
    medic: sp('medic', 'Safe', ['Biological'], stats(100, 80, 80, 80, 80, 10), ['rally', 'mend', 'gash', 'jab']),
    eraser: sp('eraser', 'Safe', ['Antimemetic'], stats(80, 80, 80, 80, 80, 60), ['graze', 'zap', 'whiff', 'focus']),
    statue: sp('statue', 'Euclid', kinetic, stats(80, 100, 80, 50, 80, 5), STANDARD, 'unobserved'),
    lizard: sp('lizard', 'Keter', kinetic, stats(150, 100, 150, 100, 150, 20), STANDARD, 'adaptive'),
  },
}

// Move indices for the milestone-3 movesets.
export const HEX = { bleed: 0, stun: 1, forget: 2, trap: 3 } as const
export const MEDIC = { rally: 0, mend: 1, gash: 2, jab: 3 } as const
export const ERASER = { graze: 0, zap: 1, whiff: 2, focus: 3 } as const
