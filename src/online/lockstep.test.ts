import { describe, expect, it } from 'vitest'
import { chooseAction, chooseReplacement, randomEquipment, randomTeam } from '../ai'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { createRng, type BattleState } from '../engine'
import {
  Match,
  decodeDecision,
  encodeDecision,
  hashState,
  seatsToAct,
  type Decision,
  type MatchLog,
  type MatchSetup,
  type Seat,
} from './lockstep'

function setupFor(seed: number): MatchSetup {
  const rng = createRng(seed)
  const teams = [randomTeam(ROSTER, rng, ROSTER_ORDER), randomTeam(ROSTER, rng, ROSTER_ORDER)] as const
  return {
    seed,
    teams,
    equipment: [randomEquipment(ROSTER, rng, teams[0]), randomEquipment(ROSTER, rng, teams[1])],
    leads: [0, 0],
  }
}

/** Each seat's AI decision for the current point, as its browser would record it. */
function decide(state: BattleState, seat: Seat, rng: ReturnType<typeof createRng>): string {
  const d: Decision =
    state.phase === 'replace'
      ? { kind: 'replace', teamIndex: chooseReplacement(state, ROSTER, seat, rng) }
      : chooseAction(state, ROSTER, seat, rng)
  return encodeDecision(d)
}

/** Play a whole battle through the shared log, the way the two browsers would. */
function playThrough(setup: MatchSetup) {
  const seats = [new Match(ROSTER, setup), new Match(ROSTER, setup)]
  const rngs = [createRng(setup.seed ^ 1), createRng(setup.seed ^ 2)]
  const decisions: [string | null, string | null][] = []
  for (let guard = 0; seats[0].state.phase !== 'ended' && guard < 500; guard++) {
    const k = seats[0].applied
    decisions[k] = [null, null]
    // Seat 1 records first sometimes: order must not matter.
    const order: Seat[] = k % 2 ? [1, 0] : [0, 1]
    for (const seat of order) {
      if (seats[seat].needs(seat)) decisions[k][seat] = decide(seats[seat].state, seat, rngs[seat])
      // Each browser syncs whenever the log changes, including half-complete points.
      for (const m of seats) m.sync({ decisions, outcome: null })
    }
  }
  return { seats, log: { decisions, outcome: null } as MatchLog }
}

describe('decisions', () => {
  it('round-trip through their encoding', () => {
    const all: Decision[] = [
      { kind: 'move', moveIndex: 3 },
      { kind: 'switch', teamIndex: 5 },
      { kind: 'replace', teamIndex: 0 },
    ]
    for (const d of all) expect(decodeDecision(encodeDecision(d))).toEqual(d)
    for (const junk of ['m4', 's6', 'x1', '', 7, null]) expect(decodeDecision(junk)).toBeNull()
  })
})

describe('lockstep', () => {
  it.each([1, 2, 3, 4, 5])('gives both browsers the same battle, start to finish (seed %i)', (seed) => {
    const { seats } = playThrough(setupFor(seed))
    expect(seats[0].state.phase).toBe('ended')
    expect(hashState(seats[0].state)).toBe(hashState(seats[1].state))
    expect(seats[0].applied).toBe(seats[1].applied)
  })

  it('lets a browser that reloads replay the whole log in one go', () => {
    const setup = setupFor(9)
    const { seats, log } = playThrough(setup)
    const rejoined = new Match(ROSTER, setup)
    const r = rejoined.sync(log)
    expect(r.steps).toHaveLength(seats[0].applied)
    expect(hashState(rejoined.state)).toBe(hashState(seats[0].state))
  })

  it('waits until every seat that must act has decided', () => {
    const m = new Match(ROSTER, setupFor(3))
    expect(seatsToAct(m.state)).toEqual([0, 1])
    expect(m.sync({ decisions: [['m0', null]], outcome: null }).steps).toEqual([])
    expect(m.applied).toBe(0)
    expect(m.sync({ decisions: [['m0', 'm1']], outcome: null }).steps).toHaveLength(1)
    expect(m.applied).toBe(1)
  })

  it('applies a forfeit at the recorded point, ignoring anything after it', () => {
    const setup = setupFor(4)
    const decisions: [string | null, string | null][] = [['m0', 'm0']]
    const m = new Match(ROSTER, setup)
    m.sync({ decisions, outcome: null })
    const r = m.sync({ decisions: [...decisions, ['m1', 'm1']], outcome: { kind: 'forfeit', seat: 1, atStep: 1 } })
    expect(m.applied).toBe(1)
    expect(m.state.winner).toBe(0)
    expect(r.steps.at(-1)?.result.events.some((e) => e.type === 'forfeit')).toBe(true)
  })

  it('replays from the start if an abandon lands before steps already shown', () => {
    const setup = setupFor(5)
    const m = new Match(ROSTER, setup)
    m.sync({ decisions: [['m0', 'm0'], ['m0', 'm0']], outcome: null })
    const r = m.sync({ decisions: [['m0', 'm0'], ['m0', 'm0']], outcome: { kind: 'abandoned', seat: 0, atStep: 1 } })
    expect(r.reset).toBe(true)
    expect(m.applied).toBe(1)
    expect(m.state.winner).toBe(1)
  })

  it('stops on No Contest and flags illegal decisions', () => {
    const m = new Match(ROSTER, setupFor(6))
    expect(m.sync({ decisions: [['m0', 'm0']], outcome: { kind: 'noContest' } }).steps).toEqual([])
    const bad = new Match(ROSTER, setupFor(6))
    // Replacing during a normal turn is illegal; so is switching to the active SCP.
    expect(bad.sync({ decisions: [['r1', 'm0']], outcome: null }).invalid).toBe(true)
    expect(new Match(ROSTER, setupFor(6)).sync({ decisions: [['s0', 'm0']], outcome: null }).invalid).toBe(true)
  })
})
