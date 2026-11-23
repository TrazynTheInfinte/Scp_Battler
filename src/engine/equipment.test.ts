import { describe, expect, it } from 'vitest'
import { activeOf, createBattle, resolveTurn } from './battle'
import type { BattleEvent, Choice } from './model'
import { FOCUS, HEX, JAB, dex } from './testing/fixtures'
import { padTeam } from './testing/teams'

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)

/** A battle between two leads (padded to full teams), each with the given Equipment. */
const battle = (a: string, aGear: string | null, b: string, bGear: string | null) =>
  createBattle(dex, [padTeam(dex, [a]), padTeam(dex, [b])], [0, 0], 1, [[aGear], [bGear]])

describe('Equipment in battle', () => {
  it('Medkit heals 1/16 at end of turn when hurt, and the log names it', () => {
    const s = battle('fast', 'medkit', 'slow', null)
    const r = resolveTurn(s, dex, [move(FOCUS), move(JAB)])
    const fast = activeOf(r.state, 0)
    // 1/16 of max HP, capped at what Jab took.
    const taken = ofType(r.events, 'damage')[0].amount
    const healed = Math.min(taken, Math.floor(fast.stats.hp / 16))
    expect(ofType(r.events, 'equipment')).toEqual([{ type: 'equipment', side: 0, equipmentId: 'medkit' }])
    expect(ofType(r.events, 'heal')).toEqual([{ type: 'heal', side: 0, amount: healed, hpAfter: fast.hp }])
  })

  it('Reactive Plating hurts an attacker that damages it', () => {
    const s = battle('fast', null, 'warder', 'plating')
    const r = resolveTurn(s, dex, [move(JAB), move(FOCUS)])
    const fast = activeOf(r.state, 0)
    expect(ofType(r.events, 'abilityDamage')).toEqual([
      { type: 'abilityDamage', side: 0, amount: Math.floor(fast.stats.hp / 8), hpAfter: fast.hp },
    ])
  })

  it('Ammo Pouch gives every move 50% more PP', () => {
    const s = battle('fast', 'pouch', 'slow', null)
    expect(activeOf(s, 0).pp).toEqual([96, 96, 96, 96])
    expect(activeOf(s, 1).pp).toEqual([64, 64, 64, 64])
  })

  it('Hazmat Suit blocks Bleeding', () => {
    const s = battle('hexer', null, 'slow', 'hazmat')
    const r = resolveTurn(s, dex, [move(HEX.bleed), move(FOCUS)])
    expect(activeOf(r.state, 1).status).toBeNull()
  })

  it("works alongside the SCP's own ability", () => {
    const s = battle('fast', null, 'lizard', 'plating')
    const r = resolveTurn(s, dex, [move(JAB), move(FOCUS)])
    expect(ofType(r.events, 'ability').map((e) => e.abilityId)).toEqual(['adaptive'])
    expect(ofType(r.events, 'equipment').map((e) => e.equipmentId)).toEqual(['plating'])
  })

  it('rejects illegal Equipment', () => {
    expect(() => battle('fast', 'nope', 'slow', null)).toThrow(/illegal/)
  })
})
