import { beforeEach, describe, expect, it, vi } from 'vitest'
import { chooseAction, chooseReplacement } from '../ai'
import { ROSTER } from '../data/roster'
import { createRng } from '../engine'
import { padTeam } from '../engine/testing/teams'
import type { Outcome } from '../online/lockstep'
import type { RoomData } from '../online/roomData'
import type { DriverStatus } from './battleDriver'
import { PLAYER } from './battleLog'
import { mirrorState } from './mirror'
import { OnlineDriver } from './onlineDriver'

/** An in-memory Room standing in for Firebase: writes land here, then both drivers see the change. */
let room: RoomData
let drivers: OnlineDriver[] = []
const publish = () => {
  room = { ...room, log: { ...room.log, decisions: room.log.decisions.map((d) => [...d] as [string | null, string | null]) } }
  for (const d of drivers) d.update(room)
}

vi.mock('../online/room', () => ({
  submitDecision: async (_code: string, step: number, seat: 0 | 1, decision: string) => {
    const decisions = room.log.decisions.map((d) => [...d] as [string | null, string | null])
    decisions[step] ??= [null, null]
    if (decisions[step][seat] !== null) return false // write-once, like the rules
    decisions[step][seat] = decision
    room = { ...room, log: { ...room.log, decisions } }
    queueMicrotask(publish)
    return true
  },
  submitHash: async (_code: string, step: number, seat: 0 | 1, hash: string) => {
    const hashes = [...room.hashes]
    const pair: [string | null, string | null] = [...(hashes[step] ?? [null, null])]
    pair[seat] ??= hash
    hashes[step] = pair
    room = { ...room, hashes }
    return true
  },
  recordOutcome: async (_code: string, outcome: Outcome) => {
    if (room.log.outcome) return false
    room = { ...room, log: { ...room.log, outcome } }
    queueMicrotask(publish)
    return true
  },
}))

const flush = () => new Promise((r) => setTimeout(r, 0))

function newRoom(): RoomData {
  const seat = (uid: string, team: string[]) => ({
    uid,
    callsign: uid,
    team,
    equipment: team.map(() => null),
    lead: 0,
    online: true,
    done: false,
  })
  return {
    version: 'dev',
    seed: 1234,
    seats: [seat('Alpha', padTeam(ROSTER, ['scp-173', 'scp-096'])), seat('Bravo', padTeam(ROSTER, ['scp-682', 'scp-049']))],
    log: { decisions: [], outcome: null },
    hashes: [],
  }
}

beforeEach(() => {
  room = newRoom()
  drivers = [new OnlineDriver('ABCDEF', 0, room), new OnlineDriver('ABCDEF', 1, room)]
})

describe('online battles', () => {
  it('play out identically in both browsers, each seeing itself as the player', async () => {
    const views = drivers.map((d) => d.initial)
    const statuses: DriverStatus[][] = [[], []]
    drivers.forEach((d, seat) =>
      d.listen({ advance: (_steps, view) => (views[seat] = view), status: (s) => statuses[seat].push(s) }),
    )
    // Each seat names the opponent by Callsign.
    expect(drivers.map((d) => d.opponent)).toEqual(['Bravo', 'Alpha'])
    const rngs = [createRng(1), createRng(2)]
    for (let guard = 0; views[0].state.phase !== 'ended' && guard < 400; guard++) {
      for (const seat of [0, 1] as const) {
        const view = views[seat].state // the seat's own (mirrored) view: it is always PLAYER there
        if (view.phase === 'replace' && view.needsReplacement[PLAYER]) {
          drivers[seat].replace(chooseReplacement(view, ROSTER, PLAYER, rngs[seat]))
        } else if (view.phase === 'choose') {
          drivers[seat].choose(chooseAction(view, ROSTER, PLAYER, rngs[seat]))
        }
      }
      await flush()
    }
    expect(views[0].state.phase).toBe('ended')
    expect(views[1].state).toEqual(mirrorState(views[0].state))
    // Both wrote matching fingerprints, and neither called it off.
    expect(room.hashes.every((h) => h[0] === h[1])).toBe(true)
    expect(room.log.outcome).toBeNull()
    expect(statuses.flat().some((s) => s.kind === 'noContest')).toBe(false)
    // Each log opens with the opponent's Callsign.
    expect(views[1].log.some((l) => l.startsWith('Alpha deployed'))).toBe(true)
  })

  it('wait for the opponent after deciding, and end with a win when they forfeit', async () => {
    const statuses: DriverStatus[] = []
    let final = drivers[0].initial
    drivers[0].listen({ advance: (_s, v) => (final = v), status: (s) => statuses.push(s) })
    drivers[0].choose({ kind: 'move', moveIndex: 0 })
    await flush()
    expect(statuses.at(-1)).toEqual({ kind: 'waiting' })
    drivers[1].forfeit()
    await flush()
    expect(final.state.phase).toBe('ended')
    expect(final.state.winner).toBe(PLAYER)
  })

  it('call the battle off when the two browsers disagree', async () => {
    const statuses: DriverStatus[] = []
    drivers[1].listen({ advance: () => {}, status: (s) => statuses.push(s) })
    drivers[0].choose({ kind: 'move', moveIndex: 0 })
    drivers[1].choose({ kind: 'move', moveIndex: 0 })
    await flush()
    // Seat 0's browser reports a different battle after the first turn.
    room = { ...room, hashes: [['00000000', room.hashes[0]?.[1] ?? 'ffffffff']] }
    publish()
    await flush()
    expect(statuses.at(-1)).toMatchObject({ kind: 'noContest' })
    expect(room.log.outcome).toEqual({ kind: 'noContest' })
  })
})
