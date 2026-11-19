import { describe, expect, it } from 'vitest'
import { attackAndDefense } from './battle'
import { computeDamage, type DamageInput } from './damage'
import type { Combatant, MoveData } from './model'

const base: DamageInput = {
  level: 50,
  power: 100,
  attack: 100,
  defense: 100,
  sameType: false,
  effectiveness: 1,
  crit: false,
  roll: 100,
}

describe('computeDamage', () => {
  // floor(floor(22*100*100/100)/50) + 2 = 46
  it('matches the standard formula with no modifiers', () => {
    expect(computeDamage(base)).toBe(46)
  })

  it('applies the random roll (85..100)', () => {
    expect(computeDamage({ ...base, roll: 85 })).toBe(39) // 46 * 0.85 = 39.1
  })

  it('stacks same-type bonus, type, and crit multipliers', () => {
    expect(computeDamage({ ...base, sameType: true })).toBe(69)
    expect(computeDamage({ ...base, sameType: true, effectiveness: 2 })).toBe(138)
    expect(computeDamage({ ...base, sameType: true, effectiveness: 2, crit: true })).toBe(207)
    expect(computeDamage({ ...base, effectiveness: 0.25 })).toBe(11) // 11.5 floored
  })

  it('always deals at least 1 on a hit', () => {
    expect(
      computeDamage({ ...base, power: 1, attack: 1, defense: 999, effectiveness: 0.25, roll: 85 }),
    ).toBe(1)
  })
})

describe('attackAndDefense', () => {
  const combatant = (stages: Partial<Combatant['stages']>): Combatant => ({
    speciesId: 'x',
    hp: 100,
    stats: { hp: 100, atk: 100, def: 100, spa: 80, spd: 80, spe: 100 },
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...stages },
  })
  const physical: MoveData = {
    id: 'p', name: 'p', type: 'Kinetic', category: 'Physical', power: 50, accuracy: null,
  }
  const special: MoveData = { ...physical, id: 's', category: 'Special' }

  it('uses Atk/Def for physical and SpA/SpD for special moves', () => {
    const u = combatant({ atk: 2, spa: -2 })
    const t = combatant({})
    expect(attackAndDefense(u, t, physical, false)).toEqual({ attack: 200, defense: 100 })
    expect(attackAndDefense(u, t, special, false)).toEqual({ attack: 40, defense: 80 })
  })

  it('applies stages normally on a non-crit', () => {
    expect(attackAndDefense(combatant({ atk: -2 }), combatant({ def: 2 }), physical, false)).toEqual({
      attack: 50,
      defense: 200,
    })
  })

  it("on a crit, ignores the attacker's drops and the defender's boosts", () => {
    expect(attackAndDefense(combatant({ atk: -2 }), combatant({ def: 2 }), physical, true)).toEqual({
      attack: 100,
      defense: 100,
    })
  })

  it("on a crit, keeps the attacker's boosts and the defender's drops", () => {
    expect(attackAndDefense(combatant({ atk: 2 }), combatant({ def: -2 }), physical, true)).toEqual({
      attack: 200,
      defense: 50,
    })
  })
})
