import { describe, expect, it } from 'vitest'
import { ROSTER } from '../data/roster'
import { forfeit, resolveTurn, startBattle } from '../engine'
import { padTeam } from '../engine/testing/teams'
import { formatEvents } from './battleLog'
import { mirrorEvent, mirrorState } from './mirror'

const A = padTeam(ROSTER, ['scp-173'])
const B = padTeam(ROSTER, ['scp-682'])

describe('mirroring the battle for the player on side 1', () => {
  it('swaps the sides, and twice is the identity', () => {
    const s = startBattle(ROSTER, [A, B], [0, 0], 1).state
    const m = mirrorState(s)
    expect(m.sides[0]).toBe(s.sides[1])
    expect(mirrorState(m)).toEqual(s)
  })

  it('makes side 1 read as "you" in the log', () => {
    const s = startBattle(ROSTER, [A, B], [0, 0], 1).state
    const step = resolveTurn(s, ROSTER, [{ kind: 'move', moveIndex: 0 }, { kind: 'move', moveIndex: 0 }])
    const swapped = startBattle(ROSTER, [B, A], [0, 0], 1).state
    const lines = formatEvents(mirrorState(s), step.events.map(mirrorEvent), ROSTER)
    expect(lines.some((l) => l.includes('Hostile SCP-173'))).toBe(true)
    expect(lines.some((l) => l.includes('Hostile SCP-682'))).toBe(false)
    expect(mirrorState(s).sides[0].team[0].speciesId).toBe(swapped.sides[0].team[0].speciesId)
  })

  it('flips the winner', () => {
    const s = startBattle(ROSTER, [A, B], [0, 0], 1).state
    const ended = forfeit(s, 1)
    expect(mirrorState(ended.state).winner).toBe(1)
    const end = ended.events.find((e) => e.type === 'end')!
    expect(mirrorEvent(end)).toEqual({ type: 'end', winner: 1 })
  })
})
