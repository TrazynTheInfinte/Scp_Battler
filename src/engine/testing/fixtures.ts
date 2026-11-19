import type { Dex, MoveData, ObjectClass, SpeciesData, Stats } from '../model'
import type { TypeName } from '../typeChart'

/**
 * A tiny test-only Dex. Level-50 stats are base+5 (base+60 for HP).
 *
 * All fixture species share the same four Kinetic moves:
 *   0 smash  — 250 power, never misses (KOs anything in these fixtures)
 *   1 jab    — 20 power, never misses (never KOs from full HP)
 *   2 whiff  — 0% accuracy (always misses)
 *   3 focus  — Status move
 */
const moves: Record<string, MoveData> = {
  smash: { id: 'smash', name: 'Smash', type: 'Kinetic', category: 'Physical', power: 250, accuracy: null },
  jab: { id: 'jab', name: 'Jab', type: 'Kinetic', category: 'Physical', power: 20, accuracy: null },
  whiff: { id: 'whiff', name: 'Whiff', type: 'Kinetic', category: 'Physical', power: 40, accuracy: 0 },
  focus: { id: 'focus', name: 'Focus', type: 'Kinetic', category: 'Status', power: 0, accuracy: null },
}

function sp(
  id: string,
  objectClass: ObjectClass,
  types: SpeciesData['types'],
  base: Stats,
): SpeciesData {
  return { id, name: id, objectClass, types, baseStats: base, moves: ['smash', 'jab', 'whiff', 'focus'] }
}

const stats = (hp: number, atk: number, def: number, spa: number, spd: number, spe: number): Stats => ({
  hp, atk, def, spa, spd, spe,
})

const kinetic: [TypeName] = ['Kinetic']

export const SMASH = 0
export const JAB = 1
export const WHIFF = 2
export const FOCUS = 3

export const dex: Dex = {
  moves,
  species: {
    fast: sp('fast', 'Euclid', kinetic, stats(80, 120, 80, 80, 80, 130)),
    twin: sp('twin', 'Euclid', kinetic, stats(80, 120, 80, 80, 80, 130)), // same Speed as fast
    slow: sp('slow', 'Safe', ['Biological'], stats(60, 60, 60, 60, 60, 30)),
    warder: sp('warder', 'Safe', ['Thaumic'], stats(100, 60, 100, 60, 100, 40)), // resists Kinetic
    gear: sp('gear', 'Safe', ['Mechanical'], stats(70, 70, 70, 70, 70, 50)),
    keterA: sp('keterA', 'Keter', ['Reality'], stats(100, 100, 100, 100, 100, 100)),
    keterB: sp('keterB', 'Keter', ['Temporal', 'Thaumic'], stats(100, 100, 100, 100, 100, 100)),
  },
}
