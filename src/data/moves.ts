import type { MoveData, MoveEffect, StatStages, StatusName, TypeName } from '../engine'

/**
 * The Move Pool (see GLOSSARY.md): moves any SCP may be given. Each is
 * designed and balanced once and reused. An SCP's Signature Move lives in its
 * own file under scps/ instead, built with the same helpers.
 */

// --- PP ----------------------------------------------------------------------

/**
 * PP tiers: heal moves and attacks with 100+ power are limited (so healing
 * can't stall a battle forever); everything else has plenty.
 */
export const PP_LIMITED = 8
export const PP_STANDARD = 16
const attackPp = (power: number) => (power >= 100 ? PP_LIMITED : PP_STANDARD)

// --- helpers -----------------------------------------------------------------

export const phys = (
  id: string, name: string, type: TypeName, power: number, accuracy: number | null,
  effects?: MoveEffect[],
): MoveData => ({ id, name, type, category: 'Physical', power, accuracy, pp: attackPp(power), effects })

export const spec = (
  id: string, name: string, type: TypeName, power: number, accuracy: number | null,
  effects?: MoveEffect[],
): MoveData => ({ id, name, type, category: 'Special', power, accuracy, pp: attackPp(power), effects })

export const status = (
  id: string, name: string, type: TypeName, accuracy: number | null, effects: MoveEffect[],
): MoveData => ({
  id, name, type, category: 'Status', power: 0, accuracy,
  pp: effects.some((e) => e.kind === 'heal') ? PP_LIMITED : PP_STANDARD, effects,
})

/** Inflict a status on the target (`chance` percent). */
export const inflict = (s: StatusName, chance = 100): MoveEffect => ({ kind: 'status', status: s, chance })
/** Stage changes on the user. */
export const self = (changes: Partial<StatStages>): MoveEffect => ({
  kind: 'stages', who: 'user', changes, chance: 100,
})
/** Stage changes on the target (`chance` percent). */
export const foe = (changes: Partial<StatStages>, chance = 100): MoveEffect => ({
  kind: 'stages', who: 'target', changes, chance,
})
/** The user heals `percent` of its max HP. */
export const heal = (percent: number): MoveEffect => ({ kind: 'heal', percent })
/** The user's status condition is removed. */
export const cure: MoveEffect = { kind: 'cure' }

// --- the pool ----------------------------------------------------------------

export const MOVE_POOL: readonly MoveData[] = [
  phys('tickle', 'Tickle', 'Biological', 55, 100, [foe({ atk: -1 }, 30)]),
  phys('contagious-joy', 'Contagious Joy', 'Memetic', 70, 100),
  status('calming-ooze', 'Calming Ooze', 'Biological', 100, [foe({ atk: -1, spa: -1 })]),
  spec('gear-grind', 'Gear Grind', 'Mechanical', 80, 100),
  spec('refine', 'Refine', 'Reality', 70, 100),
  status('coarse', 'Coarse', 'Mechanical', null, [self({ def: 1, spd: 1 })]),
  spec('smite', 'Smite', 'Thaumic', 75, 100),
  spec('turn-back-time', 'Turn Back Time', 'Temporal', 75, 100),
  status('divine-calm', 'Divine Calm', 'Reality', null, [heal(50)]),
  phys('roll-out', 'Roll Out', 'Mechanical', 60, 100),
  phys('ram', 'Ram', 'Kinetic', 85, 90),
  phys('flank', 'Flank', 'Temporal', 50, 100),
  phys('blink', 'Blink', 'Antimemetic', 55, null),
  phys('crimson-residue', 'Crimson Residue', 'Biological', 70, 100, [inflict('Bleeding', 30)]),
  status('stalk', 'Stalk', 'Kinetic', null, [self({ atk: 1, spe: 1 })]),
  phys('rend', 'Rend', 'Kinetic', 90, 100),
  phys('relentless-pursuit', 'Relentless Pursuit', 'Memetic', 80, 100),
  status('weep', 'Weep', 'Memetic', null, [self({ atk: 1, def: 1 })]),
  status('diagnose-pestilence', 'Diagnose Pestilence', 'Thaumic', 90, [inflict('Bleeding')]),
  phys('bone-saw', 'Bone Saw', 'Thaumic', 75, 100, [inflict('Bleeding', 20)]),
  status('sedative', 'Sedative', 'Biological', 85, [inflict('Stunned')]),
  spec('data-surge', 'Data Surge', 'Mechanical', 85, 100),
  spec('corrupt-file', 'Corrupt File', 'Memetic', 75, 100, [foe({ spd: -1 }, 30)]),
  status('overclock', 'Overclock', 'Mechanical', null, [self({ spe: 1 })]),
  spec('dissonant-chord', 'Dissonant Chord', 'Memetic', 90, 100),
  spec('blood-ink', 'Blood Ink', 'Thaumic', 80, 100, [inflict('Bleeding', 30)]),
  status('crescendo', 'Crescendo', 'Memetic', null, [self({ spa: 2 })]),
  phys('crushing-jaws', 'Crushing Jaws', 'Kinetic', 95, 100),
  spec('acidic-bile', 'Acidic Bile', 'Biological', 80, 100, [foe({ def: -1 }, 20)]),
  status('regenerate', 'Regenerate', 'Biological', null, [heal(33)]),
  phys('corrosive-touch', 'Corrosive Touch', 'Temporal', 85, 100, [foe({ def: -1 }, 30)]),
  spec('decay', 'Decay', 'Temporal', 80, 100),
  phys('ambush', 'Ambush', 'Thaumic', 75, 100),
  spec('memory-hole', 'Memory Hole', 'Antimemetic', 85, 100),
  spec('negative-space', 'Negative Space', 'Antimemetic', 60, null, [foe({ spa: -1 })]),
  status('erasure', 'Erasure', 'Antimemetic', 90, [inflict('Amnesiac')]),
]
