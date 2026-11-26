import { describe, expect, it } from 'vitest'
import {
  activeOf,
  createBattle,
  legalChoices,
  resolveReplacements,
  resolveTurn,
  speedOf,
  type BattleEvent,
  type BattleState,
  type Choice,
  type Dex,
} from '../engine'
import { padTeam } from '../engine/testing/teams'
import { ROSTER } from './roster'

/**
 * Wave 16's mechanics on the real roster: Priority (Quick Strike), Draining
 * (Leech), Multi-hit (Flurry), Traps (Lay Snare), Charge (Overcharge), and
 * the Mine Detector and Tranquilizer Rounds Equipment.
 */

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const sw = (teamIndex: number): Choice => ({ kind: 'switch', teamIndex })
const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)

/** A slow test SCP (SCP-299's stats) carrying one move of each new kind. */
const TESTER = 'test-mechanics'
const QUICK = 0
const LEECH = 1
const FLURRY = 2
const SNARE = 3
const dex: Dex = {
  ...ROSTER,
  species: {
    ...ROSTER.species,
    [TESTER]: { ...ROSTER.species['scp-299'], id: TESTER, moves: ['quick-strike', 'leech', 'flurry', 'lay-snare'], ability: undefined },
  },
}

/** A sturdy, faster foe whose Weep only boosts itself. */
const WALL = 'scp-096'
const FOE_IDLE = ROSTER.species[WALL].moves.indexOf('weep')
const battle = (mine: string, foe = WALL, seed = 1, equipment: [(string | null)[], (string | null)[]] = [[], []]): BattleState =>
  createBattle(dex, [padTeam(dex, [mine]), padTeam(dex, [foe])], [0, 0], seed, equipment)
const tank = (c: { hp: number; stats: { hp: number } }) => {
  c.stats = { ...c.stats, hp: 100_000 }
  c.hp = 100_000
}

describe('Priority', () => {
  it('Quick Strike goes before a faster foe', () => {
    const s = battle(TESTER)
    expect(speedOf(activeOf(s, 1))).toBeGreaterThan(speedOf(activeOf(s, 0)))
    const moves = ofType(resolveTurn(s, dex, [move(QUICK), move(FOE_IDLE)]).events, 'move')
    expect(moves.map((e) => e.side)).toEqual([0, 1])
  })

  it("loses to SCP-173's Unobserved", () => {
    const s = createBattle(dex, [padTeam(dex, ['scp-173']), padTeam(dex, [TESTER])], [0, 0], 1)
    const moves = ofType(resolveTurn(s, dex, [move(0), move(QUICK)]).events, 'move')
    expect(moves[0].side).toBe(0)
  })
})

describe('Draining', () => {
  it('Leech heals half the damage it deals', () => {
    const s = battle(TESTER)
    tank(activeOf(s, 1))
    activeOf(s, 0).hp = 10
    const r = resolveTurn(s, dex, [move(LEECH), move(FOE_IDLE)])
    const dealt = ofType(r.events, 'damage').find((e) => e.side === 1)!.amount
    expect(ofType(r.events, 'heal').find((e) => e.side === 0)?.amount).toBe(Math.floor(dealt / 2))
  })
})

describe('Multi-hit', () => {
  it('Flurry hits 2-5 times, about as weighted, each hit its own damage event', () => {
    const counts: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0 }
    for (let seed = 1; seed <= 400; seed++) {
      const s = battle(TESTER, WALL, seed)
      tank(activeOf(s, 1))
      const r = resolveTurn(s, dex, [move(FLURRY), move(FOE_IDLE)])
      const hits = ofType(r.events, 'multiHit')[0].hits
      expect(ofType(r.events, 'damage').filter((e) => e.side === 1)).toHaveLength(hits)
      counts[hits]++
    }
    expect(counts[2] + counts[3]).toBeGreaterThan(counts[4] + counts[5])
    expect(counts[5]).toBeGreaterThan(0)
  })

  it('sets off retaliation on every hit', () => {
    const s = battle(TESTER, 'scp-299')
    tank(activeOf(s, 0))
    tank(activeOf(s, 1))
    const r = resolveTurn(s, dex, [move(FLURRY), move(ROSTER.species['scp-299'].moves.indexOf('calming-ooze'))])
    const hits = ofType(r.events, 'multiHit')[0].hits
    expect(ofType(r.events, 'abilityDamage').filter((e) => e.side === 0)).toHaveLength(hits)
  })
})

describe('Traps', () => {
  it('stack to 2 layers and hurt each SCP that switches in, 1/8 per layer', () => {
    let s = battle(TESTER)
    let r = resolveTurn(s, dex, [move(SNARE), move(FOE_IDLE)])
    expect(ofType(r.events, 'trapSet')).toEqual([{ type: 'trapSet', side: 1, layers: 1 }])
    r = resolveTurn(r.state, dex, [move(SNARE), move(FOE_IDLE)])
    r = resolveTurn(r.state, dex, [move(SNARE), move(FOE_IDLE)])
    expect(ofType(r.events, 'noEffect')).toHaveLength(1)
    s = r.state
    r = resolveTurn(s, dex, [move(SNARE), sw(1)])
    const incoming = s.sides[1].team[1]
    expect(ofType(r.events, 'trapHurt')).toEqual([
      { type: 'trapHurt', side: 1, amount: Math.floor(incoming.stats.hp / 4), hpAfter: incoming.stats.hp - Math.floor(incoming.stats.hp / 4) },
    ])
  })

  it('can Neutralize a replacement as it arrives, which asks for another', () => {
    let s = battle(TESTER)
    s = resolveTurn(s, dex, [move(SNARE), move(FOE_IDLE)]).state
    s = resolveTurn(s, dex, [move(SNARE), move(FOE_IDLE)]).state
    s.sides[1].team[0].hp = 1
    s.sides[1].team[1].hp = 1
    s = resolveTurn(s, dex, [move(QUICK), move(FOE_IDLE)]).state
    expect(s.phase).toBe('replace')
    const r = resolveReplacements(s, dex, [null, 1])
    expect(ofType(r.events, 'neutralized')).toHaveLength(1)
    expect(r.state.phase).toBe('replace')
    expect(r.state.needsReplacement).toEqual([false, true])
  })

  it('Mine Detector ignores them', () => {
    let s = battle(TESTER, WALL, 1, [[], [null, 'mineDetector']])
    s = resolveTurn(s, dex, [move(SNARE), move(FOE_IDLE)]).state
    const r = resolveTurn(s, dex, [move(SNARE), sw(1)])
    expect(ofType(r.events, 'trapHurt')).toEqual([])
  })
})

describe('Charge', () => {
  // SCP-7798 (an Apollyon) carries Overcharge as its fourth move.
  const CHARGER = 'scp-7798'
  const OVERCHARGE = ROSTER.species[CHARGER].moves.indexOf('overcharge')

  it('charges on the first turn, locks in the strike, then hits for no extra PP', () => {
    let s = battle(CHARGER)
    tank(activeOf(s, 1))
    const pp = activeOf(s, 0).pp[OVERCHARGE]
    let r = resolveTurn(s, dex, [move(OVERCHARGE), move(FOE_IDLE)])
    expect(ofType(r.events, 'charging')).toHaveLength(1)
    expect(ofType(r.events, 'damage').filter((e) => e.side === 1)).toEqual([])
    s = r.state
    expect(activeOf(s, 0).pp[OVERCHARGE]).toBe(pp - 1)
    expect(legalChoices(s, 0).filter((c) => c.kind === 'move')).toEqual([move(OVERCHARGE)])
    r = resolveTurn(s, dex, [move(OVERCHARGE), move(FOE_IDLE)])
    expect(ofType(r.events, 'damage').filter((e) => e.side === 1)).toHaveLength(1)
    expect(activeOf(r.state, 0).pp[OVERCHARGE]).toBe(pp - 1)
    expect(activeOf(r.state, 0).volatiles.charging).toBeNull()
  })

  it('switching out wastes the charge', () => {
    let s = battle(CHARGER)
    s = resolveTurn(s, dex, [move(OVERCHARGE), move(FOE_IDLE)]).state
    s = resolveTurn(s, dex, [sw(1), move(FOE_IDLE)]).state
    expect(s.sides[0].team[0].volatiles.charging).toBeNull()
  })
})

describe('Tranquilizer Rounds', () => {
  it('Stun the target on about 1 hit in 10', () => {
    let stuns = 0
    for (let seed = 1; seed <= 400; seed++) {
      const s = battle(TESTER, WALL, seed, [['tranquilizerRounds'], []])
      tank(activeOf(s, 1))
      const r = resolveTurn(s, dex, [move(LEECH), move(FOE_IDLE)])
      if (ofType(r.events, 'status').some((e) => e.side === 1 && e.status === 'Stunned')) stuns++
    }
    expect(stuns).toBeGreaterThan(20)
    expect(stuns).toBeLessThan(65)
  })
})
