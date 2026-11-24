import { describe, expect, it } from 'vitest'
import { chooseAction, chooseReplacement } from '../ai'
import { ROSTER } from '../data/roster'
import { activeOf, createRng, validateTeam, type BattleEvent } from '../engine'
import type { BattleView, Guide } from './battleDriver'
import { PLAYER } from './battleLog'
import { TUTORIAL_LEAD, TUTORIAL_OPPONENT_TEAM, TUTORIAL_PLAYER_TEAM, tutorialDriver } from './tutorial'

/** Play the whole Tutorial Battle as a player who follows every hint (and plays sensibly after). */
function playThrough() {
  const driver = tutorialDriver(TUTORIAL_LEAD)
  let view: BattleView = driver.initial
  const events: BattleEvent[] = []
  const hints: Guide[] = []
  driver.listen({
    advance: (steps, v) => {
      view = v
      for (const s of steps) events.push(...s.events)
    },
    status: () => {},
  })
  const rng = createRng(99)
  for (let guard = 0; view.state.phase !== 'ended' && guard < 300; guard++) {
    const guide = driver.guide!()
    if (guide) hints.push(guide)
    const s = view.state
    if (s.phase === 'replace') driver.replace(chooseReplacement(s, ROSTER, PLAYER, rng))
    else if (guide?.allow.kind === 'move') driver.choose({ kind: 'move', moveIndex: guide.allow.moveIndex })
    else if (guide?.allow.kind === 'switch') driver.choose({ kind: 'switch', teamIndex: guide.allow.teamIndex })
    else driver.choose(chooseAction(s, ROSTER, PLAYER, rng))
  }
  return { view, events, hints }
}

describe('Tutorial Battle', () => {
  it('uses legal teams', () => {
    expect(validateTeam(ROSTER, TUTORIAL_PLAYER_TEAM)).toEqual([])
    expect(validateTeam(ROSTER, TUTORIAL_OPPONENT_TEAM)).toEqual([])
    expect(activeOf(tutorialDriver(TUTORIAL_LEAD).initial.state, PLAYER).speciesId).toBe('scp-173')
  })

  it('teaches every lesson, in order, then plays out to the end', () => {
    const { view, events, hints } = playThrough()
    const lessons = [...new Set(hints.map((h) => h.text.split(' ')[0] + ':' + h.allow.kind))]
    // Super-effective hit, switch, status, then the hand-over (and a replacement hint when one comes up).
    const order = ['move', 'switch', 'move', 'any'].join()
    expect(lessons.map((l) => l.split(':')[1]).slice(0, 4).join()).toBe(order)
    expect(hints.some((h) => h.text.includes('Neutralized'))).toBe(true)

    // Lesson 1 landed: a super-effective hit on 068, which fell, and 049 came in.
    expect(events.some((e) => e.type === 'damage' && e.side === 1 && e.effectiveness === 2)).toBe(true)
    expect(events.some((e) => e.type === 'replace' && e.side === 1 && e.to === TUTORIAL_OPPONENT_TEAM.indexOf('scp-049'))).toBe(true)
    // Lessons 2-3: 999 switched in, was made to Bleed, and Embrace cured it.
    expect(events.some((e) => e.type === 'switch' && e.side === 0 && e.to === TUTORIAL_PLAYER_TEAM.indexOf('scp-999'))).toBe(true)
    expect(events.some((e) => e.type === 'status' && e.side === 0 && e.status === 'Bleeding')).toBe(true)
    expect(events.some((e) => e.type === 'statusEnded' && e.side === 0 && e.status === 'Bleeding')).toBe(true)
    expect(view.state.phase).toBe('ended')
  })
})
