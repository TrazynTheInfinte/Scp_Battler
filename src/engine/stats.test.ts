import { describe, expect, it } from 'vitest'
import { calcStat, stageMultiplier } from './stats'

describe('calcStat (level 50, base stats only)', () => {
  it('computes HP as (base + 60) x 1.5, rounded down', () => {
    expect(calcStat('hp', 100)).toBe(240)
    expect(calcStat('hp', 1)).toBe(91)
  })

  it('computes other stats as base + 5', () => {
    expect(calcStat('atk', 100)).toBe(105)
    expect(calcStat('spe', 30)).toBe(35)
  })
})

describe('stageMultiplier', () => {
  it('uses (2+n)/2 for boosts and 2/(2-n) for drops', () => {
    expect(stageMultiplier(0)).toBe(1)
    expect(stageMultiplier(1)).toBe(1.5)
    expect(stageMultiplier(2)).toBe(2)
    expect(stageMultiplier(6)).toBe(4)
    expect(stageMultiplier(-1)).toBeCloseTo(2 / 3)
    expect(stageMultiplier(-2)).toBe(0.5)
    expect(stageMultiplier(-6)).toBe(0.25)
  })

  it('clamps to +-6', () => {
    expect(stageMultiplier(9)).toBe(4)
    expect(stageMultiplier(-9)).toBe(0.25)
  })
})
