import { describe, expect, it } from 'vitest'
import { chooseAction, chooseReplacement, randomTeam } from '../ai'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { padTeam } from '../engine/testing/teams'
import { createRng, switchTargets } from '../engine'
import { playerForfeit, playerMustReplace, playerReplace, playerTurn, startSession, type Session } from './battleController'

const PLAYER_TEAM = padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131'])
const AI_TEAM = padTeam(ROSTER, ['scp-682', 'scp-999', 'scp-914', 'scp-131'])

describe('battle session', () => {
  it('starts with intro lines and the AI already deployed', () => {
    const { session, steps } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, 1)
    expect(session.state.phase).toBe('choose')
    expect(session.state.sides[0].active).toBe(0)
    expect(session.log[0]).toMatch(/^The hostile site deployed SCP-/)
    expect(steps).toHaveLength(1)
  })

  it('never leaves the player waiting on an AI-only replacement', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const r = createRng(seed)
      let { session } = startSession(
        ROSTER,
        randomTeam(ROSTER, r, ROSTER_ORDER),
        randomTeam(ROSTER, r, ROSTER_ORDER),
        0,
        seed,
      )
      const playerRng = createRng(seed + 1000)
      for (let i = 0; i < 400 && session.state.phase !== 'ended'; i++) {
        // The state the UI sees is always either the player's turn or the player's replacement.
        expect(session.state.phase === 'choose' || playerMustReplace(session.state), `seed ${seed}`).toBe(true)
        session = playerMustReplace(session.state)
          ? playerReplace(session, chooseReplacement(session.state, ROSTER, 0, playerRng)).session
          : playerTurn(session, chooseAction(session.state, ROSTER, 0, playerRng)).session
      }
      expect(session.state.phase, `seed ${seed}`).toBe('ended')
      expect(session.log.at(-1)).toMatch(/VICTORY|DEFEAT|DRAW/)
    }
  })

  it('forfeit ends the battle as a defeat', () => {
    const { session } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, 1)
    const after: Session = playerForfeit(session).session
    expect(after.state.winner).toBe(1)
    expect(after.log.slice(-2)).toEqual(['You forfeited.', 'DEFEAT — your containment team was lost.'])
  })

  it('replacement picks must be legal', () => {
    const { session } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, 1)
    expect(() => playerReplace(session, switchTargets(session.state, 0)[0])).toThrow(/phase/)
  })
})
