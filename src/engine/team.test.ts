import { describe, expect, it } from 'vitest'
import { TEAM_BUDGET, TEAM_SIZE, teamCost, validateTeam } from './team'
import { dex } from './testing/fixtures'

// Fixture costs: Safe 1 (slow, warder, gear, hexer, medic, eraser), Euclid 3
// (fast, twin, statue), Keter 4 (keterA, keterB, lizard), Thaumiel 4, Apollyon 6.

describe('validateTeam', () => {
  it('uses six SCPs and a budget of 15', () => {
    expect([TEAM_SIZE, TEAM_BUDGET]).toEqual([6, 15])
  })

  it('accepts a legal team within budget', () => {
    // Keter 4 + Euclid 3 + Safe 1 x4 = 11
    expect(validateTeam(dex, ['keterA', 'fast', 'slow', 'gear', 'warder', 'hexer'])).toEqual([])
  })

  it('accepts a team exactly at the budget', () => {
    // Keter 4 x3 + Safe 1 x3 = 15
    const team = ['keterA', 'keterB', 'lizard', 'slow', 'gear', 'warder']
    expect(teamCost(dex, team)).toBe(15)
    expect(validateTeam(dex, team)).toEqual([])
  })

  it('rejects teams over budget', () => {
    // Keter 4 x3 + Euclid 3 x2 + Safe 1 = 19
    expect(validateTeam(dex, ['keterA', 'keterB', 'lizard', 'fast', 'twin', 'slow'])).toEqual([
      { kind: 'overBudget', cost: 19 },
    ])
  })

  it('fits an Apollyon with a Keter and four Safes, but not with an extra Euclid', () => {
    // Apollyon 6 + Keter 4 + Safe 1 x4 = 14
    expect(validateTeam(dex, ['apollyon', 'keterA', 'slow', 'gear', 'warder', 'hexer'])).toEqual([])
    // Apollyon 6 + Keter 4 + Euclid 3 + Safe 1 x3 = 16
    expect(validateTeam(dex, ['apollyon', 'keterA', 'fast', 'slow', 'gear', 'warder'])).toEqual([
      { kind: 'overBudget', cost: 16 },
    ])
  })

  it('prices a Thaumiel like a Keter', () => {
    // Thaumiel 4 + Keter 4 x2 + Safe 1 x3 = 15
    expect(teamCost(dex, ['thaumiel', 'keterA', 'keterB', 'slow', 'gear', 'warder'])).toBe(15)
  })

  it('requires exactly six SCPs', () => {
    expect(validateTeam(dex, ['fast', 'slow', 'gear'])).toEqual([{ kind: 'size', size: 3 }])
    expect(validateTeam(dex, ['fast', 'slow', 'gear', 'warder', 'hexer', 'medic', 'eraser'])).toContainEqual({
      kind: 'size',
      size: 7,
    })
  })

  it('rejects duplicates and unknown SCPs', () => {
    expect(validateTeam(dex, ['fast', 'fast', 'slow', 'gear', 'warder', 'hexer'])).toEqual([
      { kind: 'duplicate', speciesId: 'fast' },
    ])
    expect(validateTeam(dex, ['fast', 'nope', 'slow', 'gear', 'warder', 'hexer'])).toEqual([
      { kind: 'unknown', speciesId: 'nope' },
    ])
  })
})

describe('class limits', () => {
  it('allows one Thaumiel and one Apollyon together', () => {
    // Apollyon 6 + Thaumiel 4 + Safe 1 x4 = 14
    expect(validateTeam(dex, ['apollyon', 'thaumiel', 'slow', 'gear', 'warder', 'hexer'])).toEqual([])
  })

  it('rejects a second Thaumiel even within budget', () => {
    const twoThaumiel = { ...dex, species: { ...dex.species, thaumiel2: { ...dex.species.thaumiel, id: 'thaumiel2' } } }
    // Thaumiel 4 x2 + Safe 1 x4 = 12: within budget, but over the class limit.
    expect(validateTeam(twoThaumiel, ['thaumiel', 'thaumiel2', 'slow', 'gear', 'warder', 'hexer'])).toEqual([
      { kind: 'classLimit', objectClass: 'Thaumiel', count: 2 },
    ])
  })
})
