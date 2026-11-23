import { describe, expect, it } from 'vitest'
import { activeOf, createBattle, legalChoices, resolveTurn, speedOf } from './battle'
import type { BattleEvent, BattleState, Choice, StatusName } from './model'
import { ADAPTIVE_MULTIPLIER, ERASER, FOCUS, HEX, JAB, MEDIC, dex } from './testing/fixtures'

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const sw = (teamIndex: number): Choice => ({ kind: 'switch', teamIndex })

const battle = (
  teams: [readonly string[], readonly string[]],
  leads: [number, number] = [0, 0],
  seed = 1,
): BattleState => createBattle(dex, teams, leads, seed)

const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)

const setStatus = (c: { status: unknown }, name: StatusName, turnsLeft: number | null = null) => {
  c.status = { name, turnsLeft }
}

const seeds = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

// slow: Biological, 180 max HP, Spe 35. fast: Kinetic, Spe 135. hexer: Spe 205.
const HEXER_TEAM = ['hexer', 'slow', 'warder', 'gear'] as const
const SLOW_TEAM = ['slow', 'warder', 'gear', 'fast'] as const

describe('Bleeding', () => {
  it('deals 1/8 max HP at end of turn and persists through switching', () => {
    let s = battle([HEXER_TEAM, SLOW_TEAM])
    let r = resolveTurn(s, dex, [move(HEX.bleed), move(FOCUS)])
    expect(ofType(r.events, 'status')).toEqual([{ type: 'status', side: 1, status: 'Bleeding' }])
    expect(ofType(r.events, 'residual')).toEqual([
      { type: 'residual', side: 1, status: 'Bleeding', amount: 22, hpAfter: 158 },
    ])

    // Both switch out: benched slow takes no residual but keeps the status.
    r = resolveTurn(r.state, dex, [sw(1), sw(1)])
    s = r.state
    expect(ofType(r.events, 'residual')).toEqual([])
    expect(s.sides[1].team[0].status?.name).toBe('Bleeding')
    expect(s.sides[1].team[0].hp).toBe(158)

    // Back in: bleeds again.
    r = resolveTurn(s, dex, [sw(0), sw(0)])
    expect(ofType(r.events, 'residual')).toEqual([
      { type: 'residual', side: 1, status: 'Bleeding', amount: 22, hpAfter: 136 },
    ])
  })
})

describe('status immunities and stacking', () => {
  it('Mechanical SCPs cannot Bleed', () => {
    const r = resolveTurn(battle([HEXER_TEAM, ['gear', 'slow', 'warder', 'fast']]), dex, [
      move(HEX.bleed),
      move(FOCUS),
    ])
    expect(ofType(r.events, 'noEffect').map((e) => e.side)).toContain(0)
    expect(activeOf(r.state, 1).status).toBeNull()
  })

  it('Antimemetic SCPs cannot become Amnesiac', () => {
    const r = resolveTurn(battle([HEXER_TEAM, ['eraser', 'slow', 'warder', 'gear']]), dex, [
      move(HEX.forget),
      move(ERASER.focus),
    ])
    expect(ofType(r.events, 'noEffect').map((e) => e.side)).toContain(0)
    expect(activeOf(r.state, 1).status).toBeNull()
  })

  it('an SCP with a status cannot receive another', () => {
    const s = battle([HEXER_TEAM, SLOW_TEAM])
    setStatus(activeOf(s, 1), 'Bleeding')
    const r = resolveTurn(s, dex, [move(HEX.stun), move(FOCUS)])
    expect(ofType(r.events, 'noEffect').map((e) => e.side)).toContain(0)
    expect(activeOf(r.state, 1).status?.name).toBe('Bleeding')
  })
})

describe('Stunned', () => {
  it('halves Speed, which can change turn order', () => {
    // fast (135) normally outspeeds keterA (105); Stunned fast (67) does not.
    const teams: [string[], string[]] = [
      ['fast', 'slow', 'warder', 'gear'],
      ['keterA', 'slow', 'warder', 'gear'],
    ]
    const s = battle(teams)
    expect(speedOf(activeOf(s, 0))).toBe(135)
    setStatus(activeOf(s, 0), 'Stunned')
    expect(speedOf(activeOf(s, 0))).toBe(67)
    const { events } = resolveTurn(s, dex, [move(JAB), move(JAB)])
    const firstActor = events.find((e) => e.type === 'move' || e.type === 'stunned')
    expect(firstActor?.side).toBe(1)
  })

  it('loses the turn about 25% of the time', () => {
    const lost = seeds(400).filter((seed) => {
      const s = battle([['fast', 'slow', 'warder', 'gear'], SLOW_TEAM], [0, 0], seed)
      setStatus(activeOf(s, 0), 'Stunned')
      const { events } = resolveTurn(s, dex, [move(JAB), move(FOCUS)])
      return events.some((e) => e.type === 'stunned' && e.side === 0)
    }).length
    expect(lost).toBeGreaterThan(60)
    expect(lost).toBeLessThan(140)
  })
})

describe('Amnesiac', () => {
  it('lasts a rolled 2-4 turns', () => {
    // slow acts after hexer in the same turn, so one tick is already used up:
    // a rolled 2/3/4 is observed as 1/2/3 remaining.
    const durations = new Set(
      seeds(60).map((seed) => {
        const r = resolveTurn(battle([HEXER_TEAM, SLOW_TEAM], [0, 0], seed), dex, [
          move(HEX.forget),
          move(FOCUS),
        ])
        return activeOf(r.state, 1).status?.turnsLeft
      }),
    )
    expect(durations).toEqual(new Set([1, 2, 3]))
  })

  it('uses a random move about 1/3 of the time', () => {
    const randomized = seeds(300).filter((seed) => {
      const s = battle([['fast', 'slow', 'warder', 'gear'], SLOW_TEAM], [0, 0], seed)
      setStatus(activeOf(s, 0), 'Amnesiac', 4)
      const { events } = resolveTurn(s, dex, [move(JAB), move(FOCUS)])
      return events.some((e) => e.type === 'amnesia')
    }).length
    expect(randomized).toBeGreaterThan(60)
    expect(randomized).toBeLessThan(140)
  })

  it('snaps out when the count runs out and then acts normally', () => {
    const s = battle([['fast', 'slow', 'warder', 'gear'], SLOW_TEAM])
    setStatus(activeOf(s, 0), 'Amnesiac', 1)
    const { state, events } = resolveTurn(s, dex, [move(JAB), move(FOCUS)])
    expect(events).toContainEqual({ type: 'statusEnded', side: 0, status: 'Amnesiac' })
    expect(events.some((e) => e.type === 'amnesia')).toBe(false)
    expect(ofType(events, 'move').find((e) => e.side === 0)?.moveId).toBe('jab')
    expect(activeOf(state, 0).status).toBeNull()
  })
})

describe('Contained', () => {
  it('blocks switching, deals 1/16 for 4 end-of-turn ticks, then wears off', () => {
    let s = battle([HEXER_TEAM, SLOW_TEAM])
    const residuals: number[] = []
    let endedOnTurn: number | null = null
    for (let turn = 1; turn <= 4; turn++) {
      const r = resolveTurn(s, dex, [move(HEX.trap), move(FOCUS)])
      residuals.push(...ofType(r.events, 'residual').map((e) => e.amount))
      if (r.events.some((e) => e.type === 'statusEnded')) endedOnTurn = turn
      else expect(legalChoices(r.state, 1).some((c) => c.kind === 'switch')).toBe(false)
      s = r.state
    }
    expect(residuals).toEqual([11, 11, 11, 11])
    expect(endedOnTurn).toBe(4)
    expect(activeOf(s, 1).status).toBeNull()
    expect(legalChoices(s, 1).some((c) => c.kind === 'switch')).toBe(true)
  })
})

describe('end of turn', () => {
  it('resolves the faster active first', () => {
    const run = (leads: [number, number]) => {
      const s = battle([['fast', 'slow', 'warder', 'gear'], ['slow', 'warder', 'gear', 'fast']], leads)
      setStatus(activeOf(s, 0), 'Bleeding')
      setStatus(activeOf(s, 1), 'Bleeding')
      return ofType(resolveTurn(s, dex, [move(FOCUS), move(FOCUS)]).events, 'residual').map((e) => e.side)
    }
    expect(run([0, 0])).toEqual([0, 1]) // fast vs slow
    expect(run([1, 3])).toEqual([1, 0]) // slow vs fast
  })

  it('both last SCPs falling to residual damage is a draw', () => {
    const s = battle([['fast', 'slow', 'warder', 'gear'], SLOW_TEAM])
    for (const side of s.sides) {
      side.team.forEach((c, i) => (c.hp = i === side.active ? 1 : 0))
      setStatus(side.team[side.active], 'Bleeding')
    }
    const { state, events } = resolveTurn(s, dex, [move(FOCUS), move(FOCUS)])
    expect(state.winner).toBe('draw')
    expect(events.at(-1)).toEqual({ type: 'end', winner: 'draw' })
  })
})

describe('move effects', () => {
  const MEDIC_TEAM = ['medic', 'slow', 'warder', 'gear'] as const

  it('stat changes apply, cap at +6, and a capped Status move has no effect', () => {
    let s = battle([MEDIC_TEAM, SLOW_TEAM])
    const r1 = resolveTurn(s, dex, [move(MEDIC.rally), move(FOCUS)])
    expect(ofType(r1.events, 'stage')).toEqual([{ type: 'stage', side: 0, stat: 'atk', delta: 2 }])
    s = r1.state
    activeOf(s, 0).stages.atk = 5
    const r2 = resolveTurn(s, dex, [move(MEDIC.rally), move(FOCUS)])
    expect(ofType(r2.events, 'stage')).toEqual([{ type: 'stage', side: 0, stat: 'atk', delta: 1 }])
    const r3 = resolveTurn(r2.state, dex, [move(MEDIC.rally), move(FOCUS)])
    expect(ofType(r3.events, 'stage')).toEqual([])
    expect(r3.events).toContainEqual({ type: 'noEffect', side: 0 })
  })

  it('heal restores a percent of max HP and cure removes the status', () => {
    const s = battle([MEDIC_TEAM, SLOW_TEAM])
    activeOf(s, 0).hp = 10
    setStatus(activeOf(s, 0), 'Bleeding')
    const { state, events } = resolveTurn(s, dex, [move(MEDIC.mend), move(FOCUS)])
    expect(events).toContainEqual({ type: 'heal', side: 0, amount: 120, hpAfter: 130 })
    expect(events).toContainEqual({ type: 'statusEnded', side: 0, status: 'Bleeding' })
    expect(ofType(events, 'residual')).toEqual([])
    expect(activeOf(state, 0).hp).toBe(130)
  })

  it('healing at full HP with no status has no effect', () => {
    const { events } = resolveTurn(battle([MEDIC_TEAM, SLOW_TEAM]), dex, [
      move(MEDIC.mend),
      move(FOCUS),
    ])
    expect(events).toContainEqual({ type: 'noEffect', side: 0 })
  })

  it('a damaging move applies its effects after the hit', () => {
    const { events } = resolveTurn(battle([MEDIC_TEAM, SLOW_TEAM]), dex, [
      move(MEDIC.gash),
      move(FOCUS),
    ])
    // medic (Spe 15) is slower than slow (Spe 35), so look only at the hit's results.
    const results = events
      .filter((e) => e.type === 'damage' || e.type === 'status' || e.type === 'stage')
      .map((e) => e.type)
    expect(results).toEqual(['damage', 'status', 'stage'])
    expect(events).toContainEqual({ type: 'stage', side: 1, stat: 'def', delta: -1 })
  })

  it('no effects apply if the hit Neutralizes the target', () => {
    const s = battle([MEDIC_TEAM, SLOW_TEAM])
    activeOf(s, 1).hp = 1
    const { events } = resolveTurn(s, dex, [move(MEDIC.gash), move(FOCUS)])
    expect(ofType(events, 'neutralized')).toHaveLength(1)
    expect(ofType(events, 'status')).toEqual([])
    expect(ofType(events, 'stage')).toEqual([])
  })

  it('chance-based effects sometimes trigger and sometimes do not', () => {
    const outcomes = new Set(
      seeds(60).map((seed) => {
        const r = resolveTurn(
          battle([['eraser', 'slow', 'warder', 'gear'], SLOW_TEAM], [0, 0], seed),
          dex,
          [move(ERASER.graze), move(FOCUS)],
        )
        return activeOf(r.state, 1).status?.name ?? 'none'
      }),
    )
    expect(outcomes).toEqual(new Set(['Stunned', 'none']))
  })
})

describe('ability: Unobserved (statue, Spe 10)', () => {
  const STATUE_TEAM = ['statue', 'slow', 'warder', 'gear'] as const
  const FAST_TEAM = ['fast', 'slow', 'warder', 'gear'] as const
  const firstMover = (events: BattleEvent[]) => ofType(events, 'move')[0].side

  it('moves first unless the opponent used a Status move last turn', () => {
    let r = resolveTurn(battle([STATUE_TEAM, FAST_TEAM]), dex, [move(JAB), move(FOCUS)])
    expect(firstMover(r.events)).toBe(0)
    expect(r.events).toContainEqual({ type: 'ability', side: 0, abilityId: 'unobserved' })

    // Opponent used Focus (Status) -> watched -> normal Speed order.
    r = resolveTurn(r.state, dex, [move(JAB), move(JAB)])
    expect(firstMover(r.events)).toBe(1)
    expect(ofType(r.events, 'ability')).toEqual([])

    // Opponent used Jab last turn -> unwatched again.
    r = resolveTurn(r.state, dex, [move(JAB), move(JAB)])
    expect(firstMover(r.events)).toBe(0)
  })

  it('is not watched on its first turn after switching in', () => {
    const s = battle([['fast', 'statue', 'slow', 'gear'], FAST_TEAM])
    const r1 = resolveTurn(s, dex, [sw(1), move(FOCUS)])
    const r2 = resolveTurn(r1.state, dex, [move(JAB), move(JAB)])
    expect(firstMover(r2.events)).toBe(0)
  })

  it('is switched off while it has a status condition', () => {
    // Bleeding doesn't touch Speed, so only Unobserved decides the order here.
    const s = battle([STATUE_TEAM, FAST_TEAM])
    setStatus(activeOf(s, 0), 'Bleeding')
    const r = resolveTurn(s, dex, [move(JAB), move(JAB)])
    expect(firstMover(r.events)).toBe(1)
    expect(ofType(r.events, 'ability')).toEqual([])
  })
})

describe('ability: Adaptive (lizard)', () => {
  const LIZARD_TEAM = ['lizard', 'slow', 'warder', 'gear'] as const
  const FAST_TEAM = ['fast', 'slow', 'warder', 'gear'] as const

  it('adapts to the type that hit it, announcing only a change', () => {
    const r1 = resolveTurn(battle([FAST_TEAM, LIZARD_TEAM]), dex, [move(JAB), move(FOCUS)])
    expect(r1.events).toContainEqual({
      type: 'ability',
      side: 1,
      abilityId: 'adaptive',
      typeName: 'Kinetic',
    })
    expect(activeOf(r1.state, 1).volatiles.adaptedType).toBe('Kinetic')
    const r2 = resolveTurn(r1.state, dex, [move(JAB), move(FOCUS)])
    expect(ofType(r2.events, 'ability')).toEqual([])
  })

  it('takes reduced damage from the adapted type', () => {
    const hit = (adapted: boolean) => {
      const s = battle([FAST_TEAM, LIZARD_TEAM], [0, 0], 99)
      if (adapted) activeOf(s, 1).volatiles.adaptedType = 'Kinetic'
      return ofType(resolveTurn(s, dex, [move(JAB), move(FOCUS)]).events, 'damage')[0].amount
    }
    const full = hit(false)
    expect(Math.abs(hit(true) - full * ADAPTIVE_MULTIPLIER)).toBeLessThanOrEqual(1.5)
  })

  it('remembers only the latest type, and forgets on switching out', () => {
    const s = battle([['eraser', 'slow', 'warder', 'gear'], LIZARD_TEAM])
    activeOf(s, 1).volatiles.adaptedType = 'Kinetic'
    const r = resolveTurn(s, dex, [move(ERASER.zap), move(FOCUS)])
    expect(activeOf(r.state, 1).volatiles.adaptedType).toBe('Mechanical')
    const r2 = resolveTurn(r.state, dex, [move(ERASER.focus), sw(1)])
    expect(r2.state.sides[1].team[0].volatiles.adaptedType).toBeNull()
  })
})
