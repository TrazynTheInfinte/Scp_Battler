import { describe, expect, it } from 'vitest'
import {
  activeOf,
  checkOutcome,
  createBattle,
  forfeit,
  legalChoices,
  resolveReplacements,
  resolveTurn,
  TURN_LIMIT,
} from './battle'
import type { BattleEvent, BattleState, Choice } from './model'
import { FOCUS, JAB, SMASH, WHIFF, dex } from './testing/fixtures'

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const sw = (teamIndex: number): Choice => ({ kind: 'switch', teamIndex })

// Side 0: fast(Kinetic, Spe 135) slow warder gear
// Side 1: slow(Biological, Spe 35) warder(Thaumic) gear fast
const TEAM_A = ['fast', 'slow', 'warder', 'gear'] as const
const TEAM_B = ['slow', 'warder', 'gear', 'fast'] as const

function battle(
  leads: [number, number] = [0, 0],
  seed = 1,
  teams: [readonly string[], readonly string[]] = [TEAM_A, TEAM_B],
): BattleState {
  return createBattle(dex, teams, leads, seed)
}

const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)

describe('createBattle', () => {
  it('builds level-50 combatants at full HP with the chosen leads active', () => {
    const s = battle([2, 3])
    expect(s.phase).toBe('choose')
    expect(s.turn).toBe(1)
    expect(s.sides[0].active).toBe(2)
    expect(s.sides[1].active).toBe(3)
    const fast = s.sides[0].team[0]
    expect(fast.stats).toEqual({ hp: 140, atk: 125, def: 85, spa: 85, spd: 85, spe: 135 })
    expect(fast.hp).toBe(140)
  })

  it('rejects illegal teams and out-of-range leads', () => {
    expect(() => battle([0, 0], 1, [['fast', 'fast', 'slow', 'gear'], TEAM_B])).toThrow(/illegal/)
    expect(() => battle([4, 0])).toThrow(RangeError)
  })
})

describe('turn order', () => {
  it('the faster active moves first', () => {
    // Side 0 leads slow (Spe 35), side 1 leads fast (Spe 135).
    const { events } = resolveTurn(battle([1, 3]), dex, [move(JAB), move(JAB)])
    expect(ofType(events, 'move').map((e) => e.side)).toEqual([1, 0])
  })

  it('a Speed tie is a coin flip: both orders happen, and the same seed repeats', () => {
    const firstMover = (seed: number) => {
      const s = battle([0, 0], seed, [TEAM_A, ['twin', 'slow', 'warder', 'gear']])
      return ofType(resolveTurn(s, dex, [move(JAB), move(JAB)]).events, 'move')[0].side
    }
    const firsts = new Set(Array.from({ length: 40 }, (_, i) => firstMover(i + 1)))
    expect(firsts).toEqual(new Set([0, 1]))
    expect(firstMover(7)).toBe(firstMover(7))
  })

  it('switches happen before moves', () => {
    const { events } = resolveTurn(battle(), dex, [move(JAB), sw(1)])
    expect(events[0].type).toBe('switch')
    expect(events[1].type).toBe('move')
  })

  it('when both switch, the side with the faster outgoing SCP switches first', () => {
    // Side 0 outgoing fast (135) vs side 1 outgoing slow (35).
    const a = resolveTurn(battle(), dex, [sw(1), sw(1)]).events
    expect(ofType(a, 'switch').map((e) => e.side)).toEqual([0, 1])
    // Mirror it: side 0 outgoing slow, side 1 outgoing fast.
    const b = resolveTurn(battle([1, 3]), dex, [sw(0), sw(0)]).events
    expect(ofType(b, 'switch').map((e) => e.side)).toEqual([1, 0])
  })
})

describe('attacking into a switch', () => {
  it('hits the incoming SCP, with effectiveness against its types', () => {
    // Side 1 switches slow -> warder (Thaumic resists Kinetic); side 0 smashes.
    const { state, events } = resolveTurn(battle(), dex, [move(SMASH), sw(1)])
    const [hit] = ofType(events, 'damage')
    expect(hit.side).toBe(1)
    expect(hit.effectiveness).toBe(0.5)
    expect(state.sides[1].team[1].hp).toBe(state.sides[1].team[1].stats.hp - hit.amount)
    expect(state.sides[1].team[0].hp).toBe(state.sides[1].team[0].stats.hp) // slow untouched
  })
})

describe('Neutralized', () => {
  it('an SCP Neutralized before acting does not move; its side must replace', () => {
    // fast (side 0) outspeeds and smashes slow (side 1).
    const { state, events } = resolveTurn(battle(), dex, [move(SMASH), move(SMASH)])
    expect(ofType(events, 'move').map((e) => e.side)).toEqual([0])
    expect(ofType(events, 'neutralized')).toEqual([{ type: 'neutralized', side: 1, teamIndex: 0 }])
    expect(state.sides[1].team[0].hp).toBe(0)
    expect(state.phase).toBe('replace')
    expect(state.needsReplacement).toEqual([false, true])
    expect(state.turn).toBe(1)
    expect(legalChoices(state, 0)).toEqual([])
  })

  it('the replacement comes in between turns and did not act on the turn it arrived', () => {
    const t1 = resolveTurn(battle(), dex, [move(SMASH), move(SMASH)])
    const t2 = resolveReplacements(t1.state, dex, [null, 1])
    expect(t2.events).toEqual([{ type: 'replace', side: 1, to: 1 }])
    expect(t2.state.sides[1].active).toBe(1)
    expect(t2.state.phase).toBe('choose')
    expect(t2.state.turn).toBe(2)
    // Nothing on side 1 acted during turn 1.
    expect(t1.events.some((e) => e.type === 'move' && e.side === 1)).toBe(false)
  })

  it('validates replacement picks', () => {
    const { state } = resolveTurn(battle(), dex, [move(SMASH), move(SMASH)])
    expect(() => resolveReplacements(state, dex, [null, null])).toThrow()
    expect(() => resolveReplacements(state, dex, [null, 0])).toThrow() // Neutralized
    expect(() => resolveReplacements(state, dex, [1, 1])).toThrow() // side 0 needs none
    expect(() => resolveReplacements(battle(), dex, [null, 1])).toThrow(/phase/)
  })

  it('cannot switch to a Neutralized SCP', () => {
    const s = battle()
    s.sides[0].team[1].hp = 0
    expect(legalChoices(s, 0)).not.toContainEqual(sw(1))
    expect(() => resolveTurn(s, dex, [sw(1), move(JAB)])).toThrow(/illegal/)
  })
})

describe('battle end', () => {
  it('Neutralizing the last SCP ends the battle with a winner', () => {
    const s = battle()
    for (const i of [1, 2, 3]) s.sides[1].team[i].hp = 0
    const { state, events } = resolveTurn(s, dex, [move(SMASH), move(JAB)])
    expect(state.phase).toBe('ended')
    expect(state.winner).toBe(0)
    expect(events.at(-1)).toEqual({ type: 'end', winner: 0 })
  })

  it('both sides wiped at once is a draw', () => {
    const s = battle()
    for (const side of s.sides) for (const c of side.team) c.hp = 0
    expect(checkOutcome(s)).toBe('draw')
  })

  it('forfeit ends the battle as a loss, from any phase', () => {
    expect(forfeit(battle(), 0).state.winner).toBe(1)
    const { state: replacing } = resolveTurn(battle(), dex, [move(SMASH), move(SMASH)])
    const f = forfeit(replacing, 1)
    expect(f.state.winner).toBe(0)
    expect(f.state.phase).toBe('ended')
    expect(f.events).toEqual([
      { type: 'forfeit', side: 1 },
      { type: 'end', winner: 0 },
    ])
    expect(() => forfeit(f.state, 0)).toThrow()
  })

  it('no further turns can be resolved once ended', () => {
    const { state } = forfeit(battle(), 0)
    expect(() => resolveTurn(state, dex, [move(JAB), move(JAB)])).toThrow(/phase/)
  })
})

describe('turn limit', () => {
  it('is 100 turns', () => {
    expect(TURN_LIMIT).toBe(100)
  })

  it('a battle still going after turn 99 continues', () => {
    const s = battle()
    s.turn = TURN_LIMIT - 1
    const { state, events } = resolveTurn(s, dex, [move(FOCUS), move(FOCUS)])
    expect(state.phase).toBe('choose')
    expect(events.some((e) => e.type === 'timeout')).toBe(false)
  })

  it('after the last turn, the higher share of team HP remaining wins', () => {
    const s = battle()
    s.turn = TURN_LIMIT
    // Side 1 loses half its lead's HP; side 0 is untouched.
    activeOf(s, 1).hp = Math.floor(activeOf(s, 1).stats.hp / 2)
    const { state, events } = resolveTurn(s, dex, [move(FOCUS), move(FOCUS)])
    expect(events.slice(-2)).toEqual([{ type: 'timeout' }, { type: 'end', winner: 0 }])
    expect(state.phase).toBe('ended')
    expect(state.winner).toBe(0)
  })

  it('compares shares, not raw HP', () => {
    // Side 0: max 160+160+120+130 = 570, left 290 (50.88%).
    // Side 1: max 120+130+160+140 = 550, left 280 (50.91%).
    // Side 0 has more raw HP, but side 1 has the larger share.
    const s = battle([0, 0], 1, [
      ['keterA', 'keterB', 'slow', 'gear'],
      ['slow', 'gear', 'warder', 'fast'],
    ])
    s.turn = TURN_LIMIT
    const setHp = (side: 0 | 1, hps: number[]) => hps.forEach((hp, i) => (s.sides[side].team[i].hp = hp))
    setHp(0, [160, 130, 0, 0])
    setHp(1, [120, 130, 30, 0])
    expect(resolveTurn(s, dex, [move(FOCUS), move(FOCUS)]).state.winner).toBe(1)
  })

  it('equal shares are a draw', () => {
    const s = battle()
    s.turn = TURN_LIMIT
    expect(resolveTurn(s, dex, [move(FOCUS), move(FOCUS)]).state.winner).toBe('draw')
  })

  it('a knockout on the last turn still wins outright', () => {
    const s = battle()
    s.turn = TURN_LIMIT
    for (const i of [1, 2, 3]) s.sides[1].team[i].hp = 0
    const { events } = resolveTurn(s, dex, [move(SMASH), move(JAB)])
    expect(events.some((e) => e.type === 'timeout')).toBe(false)
    expect(events.at(-1)).toEqual({ type: 'end', winner: 0 })
  })
})

describe('moves', () => {
  it('a missed move deals no damage', () => {
    const { events } = resolveTurn(battle(), dex, [move(WHIFF), move(WHIFF)])
    expect(ofType(events, 'miss')).toHaveLength(2)
    expect(ofType(events, 'damage')).toHaveLength(0)
  })

  it('status moves currently have no effect', () => {
    const { events } = resolveTurn(battle(), dex, [move(FOCUS), move(FOCUS)])
    expect(ofType(events, 'noEffect')).toHaveLength(2)
  })

  it('rejects out-of-range moves and switching to the active SCP', () => {
    expect(() => resolveTurn(battle(), dex, [move(4), move(JAB)])).toThrow(/illegal/)
    expect(() => resolveTurn(battle(), dex, [sw(0), move(JAB)])).toThrow(/illegal/)
  })

  it('stat stages are cleared when an SCP switches out', () => {
    const s = battle()
    s.sides[0].team[0].stages.atk = 2
    const { state } = resolveTurn(s, dex, [sw(1), move(JAB)])
    expect(state.sides[0].team[0].stages.atk).toBe(0)
  })
})

describe('determinism and purity', () => {
  it('the same seed and choices produce identical results', () => {
    const run = () => {
      let s = battle([0, 0], 2024)
      const log: BattleEvent[] = []
      for (let i = 0; i < 5 && s.phase === 'choose'; i++) {
        const r = resolveTurn(s, dex, [move(JAB), move(JAB)])
        s = r.state
        log.push(...r.events)
      }
      return { s, log }
    }
    expect(run()).toEqual(run())
  })

  it('never mutates the input state', () => {
    const s = battle()
    const before = JSON.stringify(s)
    resolveTurn(s, dex, [move(SMASH), move(SMASH)])
    resolveTurn(s, dex, [sw(2), sw(2)])
    forfeit(s, 0)
    expect(JSON.stringify(s)).toBe(before)
    expect(activeOf(s, 1).hp).toBe(activeOf(s, 1).stats.hp)
  })
})
