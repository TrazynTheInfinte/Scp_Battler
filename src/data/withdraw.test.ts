import { describe, expect, it } from 'vitest'
import { padTeam } from '../engine/testing/teams'
import { activeOf, resolveReplacements, resolveTurn, startBattle, type BattleState, type Choice } from '../engine'
import { ROSTER } from './roster'

// SCP-970 (Friend's Pick): Demanifest and Random Manifestation, the two
// ways an SCP withdraws at the end of a turn.
const ME = padTeam(ROSTER, ['scp-970'])
const FOE = padTeam(ROSTER, ['scp-999'])
const DEMANIFEST = ROSTER.species['scp-970'].moves.indexOf('demanifest')
const STALK = ROSTER.species['scp-970'].moves.indexOf('stalk')
const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
// 999's Tickle (no PP trouble, little damage) keeps the opposing side out of the way.
const TICKLE = move(ROSTER.species['scp-999'].moves.indexOf('tickle'))

const start = (seed = 1) => startBattle(ROSTER, [ME, FOE], [0, 0], seed).state

describe('withdrawing', () => {
  it('Demanifest clears its status and stat changes, then it withdraws and its side picks who comes in', () => {
    let s = resolveTurn(start(), ROSTER, [move(STALK), TICKLE]).state
    s = { ...s, sides: [{ ...s.sides[0], team: s.sides[0].team.map((c, i) => (i === 0 ? { ...c, status: { name: 'Bleeding', turnsLeft: null } } : c)) }, s.sides[1]] }
    expect(activeOf(s, 0).stages.atk).toBe(1)
    const r = resolveTurn(s, ROSTER, [move(DEMANIFEST), TICKLE])
    expect(r.events).toContainEqual({ type: 'withdraw', side: 0 })
    expect(r.state.phase).toBe('replace')
    expect(r.state.needsReplacement).toEqual([true, false])
    const after = resolveReplacements(r.state, ROSTER, [2, null]).state
    expect(after.sides[0].active).toBe(2)
    const benched = after.sides[0].team[0]
    expect(benched.hp).toBeGreaterThan(0)
    expect(benched.status).toBeNull()
    expect(benched.stages.atk).toBe(0)
    expect(after.phase).toBe('choose')
  })

  it('Demanifest escapes Contained (it clears it first), but nobody can withdraw with no one to send in', () => {
    const contained = start()
    contained.sides[0].team[0].status = { name: 'Contained', turnsLeft: 4 }
    // Demanifest clears Contained first, so it still gets away: reset happens before withdrawing.
    expect(resolveTurn(contained, ROSTER, [move(DEMANIFEST), TICKLE]).state.phase).toBe('replace')

    const alone: BattleState = start()
    for (let i = 1; i < alone.sides[0].team.length; i++) alone.sides[0].team[i].hp = 0
    const r = resolveTurn(alone, ROSTER, [move(DEMANIFEST), TICKLE])
    expect(r.events.some((e) => e.type === 'withdraw')).toBe(false)
    expect(r.state.phase).toBe('choose')
  })

  it('Random Manifestation withdraws it at the end of about 1 turn in 10', () => {
    let fired = 0
    const tries = 400
    for (let seed = 1; seed <= tries; seed++) {
      const r = resolveTurn(start(seed), ROSTER, [move(STALK), TICKLE])
      if (r.events.some((e) => e.type === 'withdraw' && e.side === 0)) {
        fired++
        expect(r.events).toContainEqual({ type: 'ability', side: 0, abilityId: 'randomManifestation' })
        expect(r.state.needsReplacement[0]).toBe(true)
      }
    }
    expect(fired / tries).toBeGreaterThan(0.05)
    expect(fired / tries).toBeLessThan(0.15)
  })
})
