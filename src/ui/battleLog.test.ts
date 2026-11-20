import { describe, expect, it } from 'vitest'
import { ROSTER } from '../data/roster'
import { createBattle, resolveTurn, type BattleEvent } from '../engine'
import { formatEvents } from './battleLog'

const s = createBattle(
  ROSTER,
  [
    ['scp-173', 'scp-999', 'scp-914', 'scp-131'],
    ['scp-682', 'scp-999', 'scp-914', 'scp-131'],
  ],
  [0, 0],
  1,
)
const fmt = (events: BattleEvent[]) => formatEvents(s, events, ROSTER)

describe('formatEvents', () => {
  it('names the player plainly and the opponent as Hostile', () => {
    expect(fmt([{ type: 'move', side: 0, moveId: 'neck-snap' }])).toEqual(['SCP-173 used Neck Snap.'])
    expect(fmt([{ type: 'move', side: 1, moveId: 'rampage' }])).toEqual(['Hostile SCP-682 used Rampage.'])
  })

  it('shows exact damage for the player and a percentage for the opponent', () => {
    expect(
      fmt([{ type: 'damage', side: 0, amount: 30, hpAfter: 105, effectiveness: 1, crit: false }]),
    ).toEqual(['SCP-173 lost 30 HP.'])
    // 682 has 225 max HP: 45 is 20%.
    expect(
      fmt([{ type: 'damage', side: 1, amount: 45, hpAfter: 180, effectiveness: 2, crit: true }]),
    ).toEqual(['Critical breach!', 'Highly effective.', 'Hostile SCP-682 lost 20% HP.'])
  })

  it('tracks switches so later lines name the new active', () => {
    expect(
      fmt([
        { type: 'switch', side: 0, from: 0, to: 1 },
        { type: 'move', side: 0, moveId: 'embrace' },
        { type: 'replace', side: 1, to: 2 },
        { type: 'status', side: 1, status: 'Contained' },
      ]),
    ).toEqual([
      'You withdrew SCP-173 and deployed SCP-999.',
      'SCP-999 used Embrace.',
      'The hostile site deployed SCP-914.',
      'Hostile SCP-914 is now CONTAINED.',
    ])
  })

  it('formats abilities, stages, timeout, and the result', () => {
    expect(
      fmt([
        { type: 'ability', side: 1, abilityId: 'adaptive', typeName: 'Kinetic' },
        { type: 'ability', side: 0, abilityId: 'unobserved' },
        { type: 'stage', side: 0, stat: 'atk', delta: 2 },
        { type: 'stage', side: 1, stat: 'spe', delta: -1 },
        { type: 'timeout' },
        { type: 'end', winner: 0 },
      ]),
    ).toEqual([
      "Hostile SCP-682's ADAPTIVE: now resistant to Kinetic.",
      "SCP-173's UNOBSERVED!",
      "SCP-173's Atk rose sharply.",
      "Hostile SCP-682's Speed fell.",
      'CONTAINMENT TIMEOUT — decided by remaining HP.',
      'VICTORY — hostile anomalies neutralized.',
    ])
  })

  it('produces a line for every event of a real turn', () => {
    const r = resolveTurn(s, ROSTER, [
      { kind: 'move', moveIndex: 0 },
      { kind: 'move', moveIndex: 0 },
    ])
    const lines = formatEvents(s, r.events, ROSTER)
    expect(lines.length).toBeGreaterThanOrEqual(r.events.length)
    for (const line of lines) expect(line).not.toMatch(/undefined|NaN/)
  })
})
