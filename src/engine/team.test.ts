import { describe, expect, it } from 'vitest'
import { teamCost, validateTeam } from './team'
import { dex } from './testing/fixtures'

describe('validateTeam', () => {
  it('accepts a legal team of four within budget', () => {
    // Keter 4 + Euclid 3 + Safe 1 + Safe 1 = 9
    expect(validateTeam(dex, ['keterA', 'fast', 'slow', 'gear'])).toEqual([])
  })

  it('accepts a team exactly at the budget of 10', () => {
    // Keter 4 + Keter 4 + Safe 1 + Safe 1 = 10
    expect(teamCost(dex, ['keterA', 'keterB', 'slow', 'gear'])).toBe(10)
    expect(validateTeam(dex, ['keterA', 'keterB', 'slow', 'gear'])).toEqual([])
  })

  it('rejects teams over budget', () => {
    // Keter 4 + Keter 4 + Euclid 3 + Euclid 3 = 14
    expect(validateTeam(dex, ['keterA', 'keterB', 'fast', 'twin'])).toEqual([
      { kind: 'overBudget', cost: 14 },
    ])
  })

  it('requires exactly four SCPs', () => {
    expect(validateTeam(dex, ['fast', 'slow', 'gear'])).toEqual([{ kind: 'size', size: 3 }])
    expect(validateTeam(dex, ['fast', 'slow', 'gear', 'warder', 'twin'])).toContainEqual({
      kind: 'size',
      size: 5,
    })
  })

  it('rejects duplicates and unknown SCPs', () => {
    expect(validateTeam(dex, ['fast', 'fast', 'slow', 'gear'])).toEqual([
      { kind: 'duplicate', speciesId: 'fast' },
    ])
    expect(validateTeam(dex, ['fast', 'nope', 'slow', 'gear'])).toEqual([
      { kind: 'unknown', speciesId: 'nope' },
    ])
  })
})
