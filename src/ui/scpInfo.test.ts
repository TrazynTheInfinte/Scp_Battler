import { describe, expect, it } from 'vitest'
import { ROSTER } from '../data/roster'
import { createCombatant, type BattleState } from '../engine'
import type { Step } from './battleController'
import { abilityRevealed, abilityReveals, redactionFor, stageSummary } from './scpInfo'

describe('redaction', () => {
  it('never hides anything on a normal SCP', () => {
    expect(redactionFor('scp-173', { own: false })).toBeNull()
  })

  it("hides a Gift SCP's stats, ability and unused moves", () => {
    expect(redactionFor('gift-phoenix', { own: false })).toEqual({ stats: true, ability: true, moves: [true, true, true, true] })
  })

  it('reveals each move once its PP has gone down, and the ability once shown', () => {
    const c = createCombatant(ROSTER, 'gift-phoenix')
    c.pp[2] -= 1
    const r = redactionFor('gift-phoenix', { own: false, combatant: c, abilityRevealed: true })
    expect(r?.moves).toEqual([true, true, false, true])
    expect(r?.ability).toBe(false)
    expect(redactionFor('gift-phoenix', { own: false, combatant: { ...c, reborn: true } })?.ability).toBe(false)
  })

  it('never applies to your own Gift SCPs', () => {
    expect(redactionFor('gift-phoenix', { own: true })).toBeNull()
  })
})

describe('ability reveals', () => {
  const state = (lead: string, foe: string) =>
    ({
      sides: [
        { active: 0, team: [createCombatant(ROSTER, lead)] },
        { active: 0, team: [createCombatant(ROSTER, foe)] },
      ],
    }) as unknown as BattleState
  const step = (s: BattleState, events: Step['events']): Step => ({ before: s, after: s, events, lines: [] })

  it('come from Rebirth, Rewind, Crescendo stacks and Loaded Dice crits', () => {
    const s = state('gift-lucky-break', 'gift-conductor')
    expect(abilityReveals([step(s, [{ type: 'stacks', side: 1, stacks: 1 }])])).toEqual(['1:0'])
    expect(abilityReveals([step(s, [{ type: 'revive', side: 0, hpAfter: 5 }])])).toEqual(['0:0'])
    const crit = { type: 'damage', side: 1, amount: 9, hpAfter: 1, effectiveness: 1, crit: true } as const
    expect(abilityReveals([step(s, [crit])])).toEqual(['0:0'])
    // A crit from an SCP without a crit ability reveals nothing.
    expect(abilityReveals([step(state('scp-173', 'gift-conductor'), [crit])])).toEqual([])
    expect(abilityRevealed(new Set(['1:0']), 1, 0)).toBe(true)
  })

  it("count an ability event only for the SCP's own ability", () => {
    const s = state('gift-phoenix', 'scp-173')
    expect(abilityReveals([step(s, [{ type: 'ability', side: 0, abilityId: 'rebirth' }])])).toEqual(['0:0'])
    expect(abilityReveals([step(s, [{ type: 'ability', side: 0, abilityId: 'medkit' }])])).toEqual([])
  })
})

it('stat changes read as a list', () => {
  expect(stageSummary({ atk: 1, def: -2, spa: 0, spd: 0, spe: 0, acc: 0 })).toBe('Atk +1, Def −2')
  expect(stageSummary({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0 })).toBe('')
})
