import { describe, expect, it } from 'vitest'
import { TYPE_RING, matchup, typeEffectiveness, type TypeName } from './typeChart'

// The table agreed in design, row by row.
const SUPER_EFFECTIVE: Record<TypeName, [TypeName, TypeName]> = {
  Mechanical: ['Antimemetic', 'Memetic'],
  Antimemetic: ['Memetic', 'Biological'],
  Memetic: ['Biological', 'Reality'],
  Biological: ['Reality', 'Thaumic'],
  Reality: ['Thaumic', 'Temporal'],
  Thaumic: ['Temporal', 'Kinetic'],
  Temporal: ['Kinetic', 'Mechanical'],
  Kinetic: ['Mechanical', 'Antimemetic'],
}

describe('type ring', () => {
  it('matches the agreed super-effective table', () => {
    for (const attack of TYPE_RING) {
      const strong = TYPE_RING.filter((d) => matchup(attack, d) === 2)
      expect(strong.sort()).toEqual([...SUPER_EFFECTIVE[attack]].sort())
    }
  })

  it('is resisted (x0.5) by exactly the two types that beat it', () => {
    for (const attack of TYPE_RING) {
      const resisted = TYPE_RING.filter((d) => matchup(attack, d) === 0.5)
      const beatenBy = TYPE_RING.filter((t) => SUPER_EFFECTIVE[t].includes(attack))
      expect(resisted.sort()).toEqual(beatenBy.sort())
    }
  })

  it('is neutral otherwise, including same-type, with no immunities', () => {
    for (const attack of TYPE_RING) {
      const counts = { 2: 0, 1: 0, 0.5: 0 }
      for (const d of TYPE_RING) counts[matchup(attack, d)]++
      expect(counts).toEqual({ 2: 2, 1: 4, 0.5: 2 })
      expect(matchup(attack, attack)).toBe(1)
    }
  })

  it('stacks multipliers against dual types', () => {
    expect(typeEffectiveness('Kinetic', ['Mechanical', 'Antimemetic'])).toBe(4)
    expect(typeEffectiveness('Kinetic', ['Thaumic', 'Temporal'])).toBe(0.25)
    expect(typeEffectiveness('Kinetic', ['Mechanical', 'Thaumic'])).toBe(1)
    expect(typeEffectiveness('Kinetic', ['Biological'])).toBe(1)
  })
})
