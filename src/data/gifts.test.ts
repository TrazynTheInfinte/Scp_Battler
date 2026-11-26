import { describe, expect, it } from 'vitest'
import {
  activeOf,
  createBattle,
  resolveTurn,
  type BattleEvent,
  type BattleState,
  type Choice,
} from '../engine'
import { padTeam } from '../engine/testing/teams'
import { ROSTER } from './roster'

/**
 * The Gift SCPs' new mechanics, on the real roster: Loaded Dice, Jackpot,
 * All In, Rebirth, Crescendo and Finale, Rewind, and Foretold Strike.
 */

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const sw = (teamIndex: number): Choice => ({ kind: 'switch', teamIndex })
const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)

/** A sturdy opponent. */
const WALL = 'scp-096'
const battle = (gift: string, foe = WALL, seed = 1): BattleState =>
  createBattle(ROSTER, [padTeam(ROSTER, [gift]), padTeam(ROSTER, [foe])], [0, 0], seed)
/** Weep: a Status move that only boosts the opponent itself, so it never interferes. */
const FOE_IDLE = ROSTER.species[WALL].moves.indexOf('weep')
/** Give a combatant a huge HP pool, so damage is never capped by a KO. */
const tank = (c: { hp: number; stats: { hp: number } }) => {
  c.stats = { ...c.stats, hp: 100_000 }
  c.hp = 100_000
}

describe('The Lucky Break (SCP-PT-1)', () => {
  it('Loaded Dice: crits about 1 time in 6', () => {
    let hits = 0
    let crits = 0
    for (let seed = 1; seed <= 1200; seed++) {
      const s = battle('gift-lucky-break', WALL, seed)
      // Snake Eyes: 60 power, never KOs the wall.
      const r = resolveTurn(s, ROSTER, [move(3), move(FOE_IDLE)])
      for (const d of ofType(r.events, 'damage').filter((e) => e.side === 1)) {
        hits++
        if (d.crit) crits++
      }
    }
    expect(crits / hits).toBeGreaterThan(0.13)
    expect(crits / hits).toBeLessThan(0.21)
  })

  it('Jackpot: power is rolled each use, from 20 to 160', () => {
    const damage: number[] = []
    for (let seed = 1; seed <= 300; seed++) {
      const r = resolveTurn(battle('gift-lucky-break', WALL, seed), ROSTER, [move(0), move(FOE_IDLE)])
      for (const d of ofType(r.events, 'damage').filter((e) => e.side === 1 && !e.crit)) damage.push(d.amount)
    }
    // Rolled power swings far more than the usual 85-100% damage roll.
    expect(Math.max(...damage) / Math.min(...damage)).toBeGreaterThan(4)
  })

  it('All In: a miss costs the user 1/4 of its max HP', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const r = resolveTurn(battle('gift-lucky-break', WALL, seed), ROSTER, [move(1), move(FOE_IDLE)])
      if (!ofType(r.events, 'miss').some((e) => e.side === 0)) continue
      const me = activeOf(r.state, 0)
      expect(ofType(r.events, 'recoil')).toEqual([
        { type: 'recoil', side: 0, amount: Math.floor(me.stats.hp / 4), hpAfter: me.stats.hp - Math.floor(me.stats.hp / 4) },
      ])
      return
    }
    expect.fail('All In never missed in 200 seeds')
  })
})

describe('The Phoenix (SCP-ADM-1): Rebirth', () => {
  /** The wall attacks with its first damaging move. */
  const FOE_HIT = ROSTER.species[WALL].moves.findIndex((id) => ROSTER.moves[id].category !== 'Status')

  it('rises once at 1/3 HP with status and stat stages cleared, then stays down the second time', () => {
    const s = battle('gift-phoenix')
    const phoenix = activeOf(s, 0)
    phoenix.hp = 1
    phoenix.status = { name: 'Bleeding', turnsLeft: null }
    phoenix.stages.spa = 2
    // Rising Heat (a Status move), so the Phoenix doesn't deal damage.
    let r = resolveTurn(s, ROSTER, [move(3), move(FOE_HIT)])
    expect(ofType(r.events, 'revive')).toHaveLength(1)
    expect(ofType(r.events, 'neutralized')).toEqual([])
    const back = activeOf(r.state, 0)
    expect(back.reborn).toBe(true)
    expect(back.status).toBeNull()
    expect(back.hp).toBeGreaterThan(0)
    expect(back.hp).toBe(Math.floor(back.stats.hp / 3))

    back.hp = 1
    r = resolveTurn(r.state, ROSTER, [move(3), move(FOE_HIT)])
    expect(ofType(r.events, 'revive')).toEqual([])
    expect(ofType(r.events, 'neutralized').map((e) => e.side)).toEqual([0])
  })

  it('can rise from Bleeding damage at the end of the turn', () => {
    const s = battle('gift-phoenix')
    const phoenix = activeOf(s, 0)
    phoenix.hp = 1
    phoenix.status = { name: 'Bleeding', turnsLeft: null }
    const r = resolveTurn(s, ROSTER, [move(3), move(FOE_IDLE)])
    expect(ofType(r.events, 'revive')).toHaveLength(1)
    expect(activeOf(r.state, 0).hp).toBe(Math.floor(activeOf(r.state, 0).stats.hp / 3))
  })
})

describe('The Conductor (SCP-ADM-2): Crescendo and Finale', () => {
  it('builds a stack per different move, resets on a repeat, and Finale spends them', () => {
    let s = battle('gift-conductor')
    const stacks = () => activeOf(s, 0).volatiles.stacks
    const turn = (i: number) => {
      activeOf(s, 1).hp = activeOf(s, 1).stats.hp // keep the wall standing
      s = resolveTurn(s, ROSTER, [move(i), move(FOE_IDLE)]).state
    }
    turn(2) // Rest Note: first move, nothing to compare with
    expect(stacks()).toBe(0)
    turn(0) // Overture
    expect(stacks()).toBe(1)
    turn(2)
    expect(stacks()).toBe(2)
    turn(2) // repeat: the music stops
    expect(stacks()).toBe(0)
    turn(0)
    turn(1)
    turn(0)
    turn(2)
    turn(0) // capped at 4
    expect(stacks()).toBe(4)
    const r = resolveTurn(s, ROSTER, [move(3), move(FOE_IDLE)])
    expect(ofType(r.events, 'stacks').at(-1)).toEqual({ type: 'stacks', side: 0, stacks: 0 })
    expect(activeOf(r.state, 0).volatiles.stacks).toBe(0)
  })

  it('Finale hits harder with more stacks', () => {
    const finale = (stacks: number) => {
      const s = battle('gift-conductor')
      activeOf(s, 0).volatiles.stacks = stacks
      activeOf(s, 0).volatiles.lastMoveId = 'overture'
      tank(activeOf(s, 1))
      const r = resolveTurn(s, ROSTER, [move(3), move(FOE_IDLE)])
      return ofType(r.events, 'damage').find((e) => e.side === 1)?.amount ?? 0
    }
    // Using Finale after Overture adds a stack first: 0 stacks -> 1, 3 stacks -> 4.
    expect(finale(3)).toBeGreaterThan(finale(0) * 2)
  })

  it('stacks also boost its other attacks, and switching out clears them', () => {
    const s = battle('gift-conductor')
    activeOf(s, 0).volatiles.stacks = 3
    const r = resolveTurn(s, ROSTER, [sw(1), move(FOE_IDLE)])
    expect(r.state.sides[0].team[0].volatiles.stacks).toBe(0)
  })
})

describe('The Hourglass (SCP-ADM-3)', () => {
  it('Rewind: once, below 1/4 HP, HP goes back to what it was two turns ago', () => {
    let s = battle('gift-hourglass')
    const max = activeOf(s, 0).stats.hp
    // Two quiet turns (Erosion, which the wall shrugs off).
    s = resolveTurn(s, ROSTER, [move(1), move(FOE_IDLE)]).state
    const twoAgo = activeOf(s, 0).hp
    s = resolveTurn(s, ROSTER, [move(1), move(FOE_IDLE)]).state
    activeOf(s, 0).hp = Math.floor(max / 5)
    let r = resolveTurn(s, ROSTER, [move(1), move(FOE_IDLE)])
    expect(ofType(r.events, 'rewind')).toEqual([{ type: 'rewind', side: 0, hpAfter: twoAgo }])
    expect(activeOf(r.state, 0).rewound).toBe(true)

    activeOf(r.state, 0).hp = Math.floor(max / 5)
    r = resolveTurn(r.state, ROSTER, [move(1), move(FOE_IDLE)])
    expect(ofType(r.events, 'rewind')).toEqual([])
  })

  it('Rewind: an SCP that just came in rewinds to its HP on entry', () => {
    const s = battle('gift-hourglass')
    const entry = activeOf(s, 0).hp
    activeOf(s, 0).hp = 5
    const r = resolveTurn(s, ROSTER, [move(1), move(FOE_IDLE)])
    expect(ofType(r.events, 'rewind')).toEqual([{ type: 'rewind', side: 0, hpAfter: entry }])
  })

  it('Rewind also turns stat drops into boosts', () => {
    expect(ROSTER.abilities.rewind.rules.map((r) => r.kind)).toContain('reverseStatDrops')
  })

  it('Foretold Strike lands two turns later, on whoever is in then, and several can be pending', () => {
    let s = battle('gift-hourglass')
    for (const c of s.sides[1].team) tank(c)
    let r = resolveTurn(s, ROSTER, [move(0), move(FOE_IDLE)]) // turn 1: set
    expect(ofType(r.events, 'foretold')).toEqual([{ type: 'foretold', side: 0, phase: 'set' }])
    expect(ofType(r.events, 'damage').filter((e) => e.side === 1)).toEqual([])
    s = r.state
    r = resolveTurn(s, ROSTER, [move(0), sw(1)]) // turn 2: a second strike; the foe switches
    expect(r.state.delayed).toHaveLength(2)
    s = r.state
    r = resolveTurn(s, ROSTER, [move(2), move(0)]) // turn 3: the first lands on the newcomer
    expect(ofType(r.events, 'foretold')).toEqual([{ type: 'foretold', side: 1, phase: 'lands' }])
    expect(r.state.sides[1].active).toBe(1)
    const landed = r.events.findIndex((e) => e.type === 'foretold')
    expect(r.events[landed + 1]).toMatchObject({ type: 'damage', side: 1 })
    expect(r.state.delayed).toHaveLength(1)
    r = resolveTurn(r.state, ROSTER, [move(2), move(0)]) // turn 4: the second lands
    expect(ofType(r.events, 'foretold').map((e) => e.phase)).toEqual(['lands'])
    expect(r.state.delayed).toBeUndefined()
  })
})
