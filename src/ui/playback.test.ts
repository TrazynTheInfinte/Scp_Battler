import { describe, expect, it } from 'vitest'
import { chooseAction, chooseReplacement, randomTeam } from '../ai'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { padTeam } from '../engine/testing/teams'
import { createRng } from '../engine'
import { playerMustReplace, playerReplace, playerTurn, startSession, type Advance } from './battleController'
import { framesFor } from './playback'

describe('playback frames', () => {
  it('replay every turn line-for-line and end on the real state', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const r = createRng(seed)
      let adv: Advance = startSession(
        ROSTER,
        randomTeam(ROSTER, r, ROSTER_ORDER),
        randomTeam(ROSTER, r, ROSTER_ORDER),
        0,
        seed,
      )
      const playerRng = createRng(seed + 99)
      for (let i = 0; i < 300 && adv.session.state.phase !== 'ended'; i++) {
        const s = adv.session
        adv = playerMustReplace(s.state)
          ? playerReplace(s, chooseReplacement(s.state, ROSTER, 0, playerRng))
          : playerTurn(s, chooseAction(s.state, ROSTER, 0, playerRng))

        const frames = framesFor(adv.steps, ROSTER)
        // Same log lines as the step-level formatter, in the same order.
        expect(frames.flatMap((f) => f.lines)).toEqual(adv.steps.flatMap((st) => st.lines))
        // Playback ends on exactly the real state.
        expect(frames.at(-1)!.view).toEqual(adv.session.state)
        // HP shown never goes outside 0..max.
        for (const f of frames) {
          for (const side of f.view.sides) {
            for (const c of side.team) {
              expect(c.hp).toBeGreaterThanOrEqual(0)
              expect(c.hp).toBeLessThanOrEqual(c.stats.hp)
            }
          }
        }
      }
    }
  })

  it('marks damage frames with the side that was hit', () => {
    const adv = startSession(
      ROSTER,
      padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131']),
      padTeam(ROSTER, ['scp-914', 'scp-999', 'scp-343', 'scp-131']),
      0,
      3,
    )
    const turn = playerTurn(adv.session, { kind: 'move', moveIndex: 1 }) // Blink never misses
    const frames = framesFor(turn.steps, ROSTER)
    expect(frames.some((f) => f.hit === 1)).toBe(true)
  })
})
