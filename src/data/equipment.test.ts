import { describe, expect, it } from 'vitest'
import { compileAbility } from '../engine'
import { EQUIPMENT, EQUIPMENT_ORDER } from './equipment'

describe('equipment data', () => {
  it('every piece has a unique id and name, costs 1-2, and compiles', () => {
    const pieces = Object.values(EQUIPMENT)
    expect(EQUIPMENT_ORDER).toHaveLength(pieces.length)
    expect(new Set(pieces.map((p) => p.name)).size).toBe(pieces.length)
    for (const p of pieces) {
      expect(EQUIPMENT[p.id], p.id).toBe(p)
      expect([1, 2], p.id).toContain(p.cost)
      expect(p.description.length, p.id).toBeGreaterThan(10)
      expect(p.rules.length, p.id).toBeGreaterThan(0)
      expect(compileAbility(p, 'equipment').source).toBe('equipment')
    }
  })

  it('lists cheapest first', () => {
    const costs = EQUIPMENT_ORDER.map((id) => EQUIPMENT[id].cost)
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
  })
})
