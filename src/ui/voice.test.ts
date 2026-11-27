import { describe, expect, it } from 'vitest'
import { OPPONENTS } from '../ai/opponents'
import { ENGINEER_MOVE_LINES, VOICE_LINES, VOICE_TRIGGERS } from '../ai/voiceLines'
import { MOVE_POOL } from '../data/moves'
import { BALANCE_ORDER, ROSTER } from '../data/roster'
import { createCombatant, moveName, type BattleEvent, type BattleState } from '../engine'
import type { Step } from './battleController'
import { voiceAfter } from './voice'

const first = () => 0
const state = (hostileHp: number[] = [100, 100]): BattleState =>
  ({
    sides: [
      { active: 0, team: [createCombatant(ROSTER, 'scp-173'), createCombatant(ROSTER, 'scp-999')] },
      {
        active: 0,
        team: hostileHp.map((hp, i) => {
          const c = createCombatant(ROSTER, i === 0 ? 'scp-096' : 'scp-682')
          return { ...c, hp: Math.round((c.stats.hp * hp) / 100) }
        }),
      },
    ],
  }) as unknown as BattleState
const step = (events: BattleEvent[], after = state()): Step => ({ before: state(), after, events, lines: [] })

describe('Voice Lines', () => {
  it('every bot has at least two lines for every trigger', () => {
    for (const o of OPPONENTS) for (const t of VOICE_TRIGGERS) expect(VOICE_LINES[o.kind][t].length).toBeGreaterThanOrEqual(2)
  })

  it('react to a knockout, a lost SCP, a super-effective hit and the end, the biggest moment winning', () => {
    const say = (events: BattleEvent[]) => voiceAfter('mtf', ROSTER, [step(events)], false, first)?.trigger
    expect(say([{ type: 'neutralized', side: 0, teamIndex: 0 }])).toBe('koFoe')
    expect(say([{ type: 'neutralized', side: 1, teamIndex: 0 }])).toBe('lostOne')
    expect(say([{ type: 'damage', side: 0, amount: 5, hpAfter: 5, effectiveness: 2, crit: false }])).toBe('superEffective')
    expect(say([{ type: 'neutralized', side: 0, teamIndex: 0 }, { type: 'end', winner: 1 }])).toBe('win')
    expect(say([{ type: 'end', winner: 0 }])).toBe('lose')
    expect(say([{ type: 'damage', side: 0, amount: 5, hpAfter: 5, effectiveness: 1, crit: false }])).toBeUndefined()
  })

  it('remark on the last SCP running low only until it has been said', () => {
    const low = step([], state([20, 0]))
    expect(voiceAfter('o5', ROSTER, [low], false, first)?.trigger).toBe('lastLow')
    expect(voiceAfter('o5', ROSTER, [low], true, first)).toBeNull()
  })
})

describe("The Engineer's move lines", () => {
  // Every attacking move a player could use, except Mundane ones (always neutral, so never super or poorly effective).
  const attacking = [...new Set(BALANCE_ORDER.flatMap((id) => ROSTER.species[id].moves))].filter((m) => {
    const move = ROSTER.moves[m]
    return move.category !== 'Status' && move.type !== 'Mundane' && !move.typeless
  })

  it('cover every attacking move, with nothing left over', () => {
    expect(attacking.filter((m) => !ENGINEER_MOVE_LINES[m])).toEqual([])
    expect(Object.keys(ENGINEER_MOVE_LINES).filter((m) => !attacking.includes(m))).toEqual([])
  })

  it("never say a shared move's own name: they use {move} instead", () => {
    for (const m of MOVE_POOL) {
      const lines = ENGINEER_MOVE_LINES[m.id]
      if (!lines) continue
      for (const text of [lines.weak, lines.strong]) {
        expect(text).toContain('{move}')
        expect(text).not.toContain(m.name)
      }
    }
  })

  it('react to your super- or poorly-effective attack with that move, named as your SCP names it', () => {
    const s = state()
    const e = (effectiveness: number): BattleEvent[] => [
      { type: 'move', side: 0, moveId: 'blink' },
      { type: 'damage', side: 1, amount: 5, hpAfter: 5, effectiveness, crit: false },
    ]
    const named = moveName(ROSTER, 'scp-173', ROSTER.moves['blink'])
    const strong = voiceAfter('engineer', ROSTER, [{ before: s, after: s, events: e(2), lines: [] }], false, first)
    expect(strong).toEqual({ trigger: 'move', text: ENGINEER_MOVE_LINES['blink'].strong.split('{move}').join(named) })
    expect(voiceAfter('engineer', ROSTER, [{ before: s, after: s, events: e(0.5), lines: [] }], false, first)?.trigger).toBe('move')
    expect(voiceAfter('engineer', ROSTER, [{ before: s, after: s, events: e(1), lines: [] }], false, first)).toBeNull()
    // Other bots don't comment on your moves.
    expect(voiceAfter('mtf', ROSTER, [{ before: s, after: s, events: e(2), lines: [] }], false, first)).toBeNull()
  })
})
