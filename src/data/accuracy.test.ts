import { describe, expect, it } from 'vitest'
import { padTeam } from '../engine/testing/teams'
import {
  accuracyMultiplier,
  activeOf,
  effectiveAccuracy,
  moveAccuracy,
  resolveTurn,
  startBattle,
  type Choice,
} from '../engine'
import { ROSTER } from './roster'

// Wave 7: accuracy stages. They only bite on moves that can miss, which is
// what sets "never misses" apart from 100%.
const start = (mine: string, theirs: string, seed = 1) =>
  startBattle(ROSTER, [padTeam(ROSTER, [mine]), padTeam(ROSTER, [theirs])], [0, 0], seed)
const move = (id: string, moveId: string): Choice => ({ kind: 'move', moveIndex: ROSTER.species[id].moves.indexOf(moveId) })

describe('accuracy stages', () => {
  it('scale a move with an accuracy number, down to half at -3, and never touch moves that never miss', () => {
    expect([0, -1, -2, -3, -4].map(accuracyMultiplier)).toEqual([1, 0.75, 0.6, 0.5, 0.5])
    expect(effectiveAccuracy(100, -1)).toBe(75)
    expect(effectiveAccuracy(90, -2)).toBe(54)
    expect(effectiveAccuracy(null, -3)).toBeNull()
  })

  it("Cast Shadows lowers the opponent's accuracy on entry, and its 100% moves then miss about 1 in 4", () => {
    const { state, events } = start('scp-205', 'scp-999')
    expect(activeOf(state, 1).stages.acc).toBe(-1)
    expect(events).toContainEqual({ type: 'stage', side: 1, stat: 'acc', delta: -1 })
    let misses = 0
    const tries = 400
    for (let seed = 1; seed <= tries; seed++) {
      const s = start('scp-205', 'scp-999', seed).state
      const r = resolveTurn(s, ROSTER, [move('scp-205', 'refine'), move('scp-999', 'tickle')])
      if (r.events.some((e) => e.type === 'miss' && e.side === 1)) misses++
    }
    expect(misses / tries).toBeGreaterThan(0.17)
    expect(misses / tries).toBeLessThan(0.33)
  })

  it('stops at -3 and clears when the SCP switches out', () => {
    let s = start('scp-184', 'scp-999').state
    for (let i = 0; i < 5; i++) {
      s = resolveTurn(s, ROSTER, [move('scp-184', 'blinding-light'), move('scp-999', 'tickle')]).state
    }
    expect(activeOf(s, 1).stages.acc).toBe(-3)
    const after = resolveTurn(s, ROSTER, [move('scp-184', 'coarse'), { kind: 'switch', teamIndex: 1 }]).state
    expect(after.sides[1].team[0].stages.acc).toBe(0)
  })

  it("Sister of the Sun never misses, and its stats can't be lowered", () => {
    const s = start('scp-179', 'scp-205').state
    const sun = activeOf(s, 0)
    expect(sun.stages.acc).toBe(0)
    expect(moveAccuracy(ROSTER, sun, ROSTER.moves['point-of-impact'])).toBeNull()
    sun.stages.acc = -3
    expect(moveAccuracy(ROSTER, sun, ROSTER.moves['point-of-impact'])).toBeNull()
  })

  it('Backwards turns stat drops into boosts, but an accuracy drop just fails', () => {
    // 184's Endless Halls (Speed -1) and 205's Cast Shadows (Accuracy -1) both fire on entry.
    const halls = start('scp-202', 'scp-184')
    expect(activeOf(halls.state, 0).stages.spe).toBe(1)
    expect(halls.events).toContainEqual({ type: 'ability', side: 0, abilityId: 'backwards' })
    expect(activeOf(start('scp-202', 'scp-205').state, 0).stages.acc).toBe(0)
  })
})
