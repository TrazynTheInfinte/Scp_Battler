import type {
  Dex, MoveData, MoveEffect, SpeciesData, StatStages, StatusName, TypeName,
} from '../engine'

/**
 * The launch roster: 12 SCPs (4 Safe, 5 Euclid, 3 Keter).
 * Base stat totals: Safe 450, Euclid 475, Keter 600.
 *
 * SCP names and concepts are from the SCP Wiki (CC BY-SA 3.0); see
 * dossiers.ts for per-article credits. Move and ability names are original.
 */

// --- move helpers -----------------------------------------------------------

/**
 * PP tiers: heal moves and attacks with 100+ power are limited (so healing
 * can't stall a battle forever); everything else has plenty.
 */
export const PP_LIMITED = 8
export const PP_STANDARD = 16
const attackPp = (power: number) => (power >= 100 ? PP_LIMITED : PP_STANDARD)

const phys = (
  id: string, name: string, type: TypeName, power: number, accuracy: number | null,
  effects?: MoveEffect[],
): MoveData => ({ id, name, type, category: 'Physical', power, accuracy, pp: attackPp(power), effects })

const spec = (
  id: string, name: string, type: TypeName, power: number, accuracy: number | null,
  effects?: MoveEffect[],
): MoveData => ({ id, name, type, category: 'Special', power, accuracy, pp: attackPp(power), effects })

const status = (
  id: string, name: string, type: TypeName, accuracy: number | null, effects: MoveEffect[],
): MoveData => ({
  id, name, type, category: 'Status', power: 0, accuracy,
  pp: effects.some((e) => e.kind === 'heal') ? PP_LIMITED : PP_STANDARD, effects,
})

const inflict = (s: StatusName, chance = 100): MoveEffect => ({ kind: 'status', status: s, chance })
const self = (changes: Partial<StatStages>): MoveEffect => ({
  kind: 'stages', who: 'user', changes, chance: 100,
})
const foe = (changes: Partial<StatStages>, chance = 100): MoveEffect => ({
  kind: 'stages', who: 'target', changes, chance,
})
const healHalf: MoveEffect = { kind: 'heal', percent: 50 }
const healThird: MoveEffect = { kind: 'heal', percent: 33 }

// --- moves -------------------------------------------------------------------

const MOVE_LIST: MoveData[] = [
  // SCP-999
  status('embrace', 'Embrace', 'Biological', null, [healThird, { kind: 'cure' }]),
  phys('tickle', 'Tickle', 'Biological', 55, 100, [foe({ atk: -1 }, 30)]),
  phys('contagious-joy', 'Contagious Joy', 'Memetic', 70, 100),
  status('calming-ooze', 'Calming Ooze', 'Biological', 100, [foe({ atk: -1, spa: -1 })]),
  // SCP-914
  spec('gear-grind', 'Gear Grind', 'Mechanical', 80, 100),
  spec('refine', 'Refine', 'Reality', 70, 100),
  status('coarse', 'Coarse', 'Mechanical', null, [self({ def: 1, spd: 1 })]),
  status('very-fine', 'Very Fine', 'Mechanical', null, [self({ spa: 2 })]),
  // SCP-343
  spec('rewrite', 'Rewrite', 'Reality', 80, 100),
  spec('smite', 'Smite', 'Thaumic', 75, 100),
  spec('turn-back-time', 'Turn Back Time', 'Temporal', 75, 100),
  status('divine-calm', 'Divine Calm', 'Reality', null, [healHalf]),
  // SCP-131
  phys('roll-out', 'Roll Out', 'Mechanical', 60, 100),
  phys('ram', 'Ram', 'Kinetic', 85, 90),
  phys('flank', 'Flank', 'Temporal', 50, 100),
  status('keep-watch', 'Keep Watch', 'Memetic', 100, [foe({ spe: -1 })]),
  // SCP-173
  phys('neck-snap', 'Neck Snap', 'Kinetic', 100, 85),
  phys('blink', 'Blink', 'Antimemetic', 55, null),
  phys('crimson-residue', 'Crimson Residue', 'Biological', 70, 100, [inflict('Bleeding', 30)]),
  status('stalk', 'Stalk', 'Kinetic', null, [self({ atk: 1, spe: 1 })]),
  // SCP-096
  phys('rend', 'Rend', 'Kinetic', 90, 100),
  phys('relentless-pursuit', 'Relentless Pursuit', 'Memetic', 80, 100),
  status('unveiled-face', 'Unveiled Face', 'Memetic', 90, [inflict('Stunned')]),
  status('weep', 'Weep', 'Memetic', null, [self({ atk: 1, def: 1 })]),
  // SCP-049
  status('diagnose-pestilence', 'Diagnose Pestilence', 'Thaumic', 90, [inflict('Bleeding')]),
  phys('the-cure', 'The Cure', 'Biological', 85, 100),
  phys('bone-saw', 'Bone Saw', 'Thaumic', 75, 100, [inflict('Bleeding', 20)]),
  status('sedative', 'Sedative', 'Biological', 85, [inflict('Stunned')]),
  // SCP-079
  spec('data-surge', 'Data Surge', 'Mechanical', 85, 100),
  spec('corrupt-file', 'Corrupt File', 'Memetic', 75, 100, [foe({ spd: -1 }, 30)]),
  status('lockdown', 'Lockdown', 'Mechanical', 90, [inflict('Contained')]),
  status('overclock', 'Overclock', 'Mechanical', null, [self({ spe: 1 })]),
  // SCP-012
  spec('dissonant-chord', 'Dissonant Chord', 'Memetic', 90, 100),
  spec('blood-ink', 'Blood Ink', 'Thaumic', 80, 100, [inflict('Bleeding', 30)]),
  status('unfinished-score', 'Unfinished Score', 'Memetic', 85, [inflict('Amnesiac')]),
  status('crescendo', 'Crescendo', 'Memetic', null, [self({ spa: 2 })]),
  // SCP-682
  phys('crushing-jaws', 'Crushing Jaws', 'Kinetic', 95, 100),
  spec('acidic-bile', 'Acidic Bile', 'Biological', 80, 100, [foe({ def: -1 }, 20)]),
  phys('rampage', 'Rampage', 'Kinetic', 110, 80),
  status('regenerate', 'Regenerate', 'Biological', null, [healThird]),
  // SCP-106
  phys('corrosive-touch', 'Corrosive Touch', 'Temporal', 85, 100, [foe({ def: -1 }, 30)]),
  spec('decay', 'Decay', 'Temporal', 80, 100),
  phys('ambush', 'Ambush', 'Thaumic', 75, 100),
  status('into-the-pocket', 'Into the Pocket', 'Thaumic', 90, [inflict('Contained')]),
  // SCP-055
  spec('memory-hole', 'Memory Hole', 'Antimemetic', 85, 100),
  spec('negative-space', 'Negative Space', 'Antimemetic', 60, null, [foe({ spa: -1 })]),
  status('erasure', 'Erasure', 'Antimemetic', 90, [inflict('Amnesiac')]),
  phys('what-isnt', "What Isn't", 'Reality', 80, 100),
]

// --- species -----------------------------------------------------------------

const SPECIES_LIST: SpeciesData[] = [
  // Safe
  {
    id: 'scp-999', name: 'SCP-999', objectClass: 'Safe', types: ['Biological'],
    baseStats: { hp: 110, atk: 60, def: 80, spa: 70, spd: 90, spe: 40 },
    moves: ['embrace', 'tickle', 'contagious-joy', 'calming-ooze'], ability: 'jovial',
  },
  {
    id: 'scp-914', name: 'SCP-914', objectClass: 'Safe', types: ['Mechanical', 'Reality'],
    baseStats: { hp: 90, atk: 60, def: 100, spa: 100, spd: 70, spe: 30 },
    moves: ['gear-grind', 'refine', 'coarse', 'very-fine'], ability: 'precisionEngineering',
  },
  {
    id: 'scp-343', name: 'SCP-343', objectClass: 'Safe', types: ['Reality', 'Temporal'],
    baseStats: { hp: 100, atk: 60, def: 70, spa: 110, spd: 80, spe: 30 },
    moves: ['rewrite', 'smite', 'turn-back-time', 'divine-calm'], ability: 'willingDetainee',
  },
  {
    id: 'scp-131', name: 'SCP-131', objectClass: 'Safe', types: ['Kinetic'],
    baseStats: { hp: 70, atk: 85, def: 55, spa: 50, spd: 55, spe: 135 },
    moves: ['roll-out', 'ram', 'flank', 'keep-watch'], ability: 'everWatchful',
  },
  // Euclid
  {
    id: 'scp-173', name: 'SCP-173', objectClass: 'Euclid', types: ['Kinetic', 'Antimemetic'],
    baseStats: { hp: 75, atk: 115, def: 110, spa: 20, spd: 55, spe: 100 },
    moves: ['neck-snap', 'blink', 'crimson-residue', 'stalk'], ability: 'unobserved',
  },
  {
    id: 'scp-096', name: 'SCP-096', objectClass: 'Euclid', types: ['Memetic'],
    baseStats: { hp: 85, atk: 85, def: 70, spa: 65, spd: 70, spe: 100 },
    moves: ['rend', 'relentless-pursuit', 'unveiled-face', 'weep'], ability: 'enraged',
  },
  {
    id: 'scp-049', name: 'SCP-049', objectClass: 'Euclid', types: ['Biological', 'Thaumic'],
    baseStats: { hp: 90, atk: 95, def: 80, spa: 75, spd: 90, spe: 45 },
    moves: ['diagnose-pestilence', 'the-cure', 'bone-saw', 'sedative'], ability: 'theCure',
  },
  {
    id: 'scp-079', name: 'SCP-079', objectClass: 'Euclid', types: ['Mechanical', 'Memetic'],
    baseStats: { hp: 95, atk: 30, def: 85, spa: 95, spd: 90, spe: 80 },
    moves: ['data-surge', 'corrupt-file', 'lockdown', 'overclock'], ability: 'bootSequence',
  },
  {
    id: 'scp-012', name: 'SCP-012', objectClass: 'Euclid', types: ['Memetic', 'Thaumic'],
    baseStats: { hp: 70, atk: 50, def: 70, spa: 105, spd: 100, spe: 80 },
    moves: ['dissonant-chord', 'blood-ink', 'unfinished-score', 'crescendo'], ability: 'morbidAllure',
  },
  // Keter
  {
    id: 'scp-682', name: 'SCP-682', objectClass: 'Keter', types: ['Kinetic', 'Biological'],
    baseStats: { hp: 90, atk: 115, def: 100, spa: 120, spd: 100, spe: 75 },
    moves: ['crushing-jaws', 'acidic-bile', 'rampage', 'regenerate'], ability: 'adaptive',
  },
  {
    id: 'scp-106', name: 'SCP-106', objectClass: 'Keter', types: ['Temporal', 'Thaumic'],
    baseStats: { hp: 110, atk: 110, def: 100, spa: 100, spd: 100, spe: 80 },
    moves: ['corrosive-touch', 'decay', 'ambush', 'into-the-pocket'], ability: 'phasing',
  },
  {
    id: 'scp-055', name: 'SCP-055', objectClass: 'Keter', types: ['Antimemetic'],
    baseStats: { hp: 110, atk: 75, def: 110, spa: 120, spd: 110, spe: 75 },
    moves: ['memory-hole', 'negative-space', 'erasure', 'what-isnt'], ability: 'selfKeepingSecret',
  },
]

export const ROSTER: Dex = {
  moves: Object.fromEntries(MOVE_LIST.map((m) => [m.id, m])),
  species: Object.fromEntries(SPECIES_LIST.map((sp) => [sp.id, sp])),
}

/** Species ids in display order (Safe, Euclid, Keter). */
export const ROSTER_ORDER: readonly string[] = SPECIES_LIST.map((sp) => sp.id)
