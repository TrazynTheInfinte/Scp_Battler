import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROSTER } from '../data/roster'
import { padTeam } from '../engine/testing/teams'
import {
  ROOM_CODE_LENGTH,
  ROOM_CODE_PATTERN,
  decodeRoom,
  hashMismatch,
  illegalSeats,
  matchSetup,
  newRoomCode,
  parseRoomCode,
} from './roomData'

const TEAM = padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131'])
const seat = (uid: string, extra: object = {}) => ({
  uid,
  callsign: uid.toUpperCase(),
  team: { speciesIds: TEAM, equipment: ['medkit', '', '', '', '', ''] },
  online: true,
  ...extra,
})

describe('Room Codes', () => {
  it('are 6 characters with no look-alikes, and typed codes are forgiving', () => {
    let i = 0
    const cycle = () => (i++ % 32) / 32
    for (let n = 0; n < 40; n++) expect(newRoomCode(cycle)).toMatch(ROOM_CODE_PATTERN)
    expect(newRoomCode(cycle)).toHaveLength(ROOM_CODE_LENGTH)
    expect(parseRoomCode(' k7qx-2m ')).toBe('K7QX2M')
    expect(parseRoomCode('k7q x2m')).toBe('K7QX2M')
    expect(parseRoomCode('k7qx2mz')).toBeNull()
    expect(parseRoomCode('abc-def')).toBe('ABCDEF')
    expect(parseRoomCode('ABCDE0')).toBeNull() // 0 never appears in a code
  })
})

describe('Rooms as stored', () => {
  it('decode seats, the decision log, hashes, and outcome', () => {
    const room = decodeRoom({
      version: 'dev',
      seed: 42,
      createdAt: 1,
      seats: { 0: seat('a', { lead: 2 }), 1: seat('b', { lead: 0, online: false }) },
      steps: { 0: { 0: 'm1', 1: 's3' }, 1: { 1: 'm0' } },
      hashes: [{ 0: 'deadbeef', 1: 'deadbeef' }],
      outcome: { kind: 'forfeit', seat: 1, atStep: 2 },
    })!
    expect(room.seats[0]).toMatchObject({ uid: 'a', lead: 2, online: true, equipment: ['medkit', null, null, null, null, null] })
    expect(room.seats[1]).toMatchObject({ uid: 'b', lead: 0, online: false, done: false })
    expect(room.log.decisions).toEqual([
      ['m1', 's3'],
      [null, 'm0'],
    ])
    expect(room.log.outcome).toEqual({ kind: 'forfeit', seat: 1, atStep: 2 })
    expect(hashMismatch(room)).toBeNull()
    expect(matchSetup(room)).toMatchObject({ seed: 42, leads: [2, 0] })
  })

  it('keep gaps in the log where the database left holes', () => {
    const room = decodeRoom({ version: 'v', seed: 1, seats: [seat('a')], steps: [null, ['m0', 'm1']] })!
    expect(room.log.decisions).toEqual([
      [null, null],
      ['m0', 'm1'],
    ])
    expect(room.seats[1]).toBeNull()
    expect(matchSetup(room)).toBeNull()
  })

  it('spot hash disagreements and illegal teams', () => {
    const room = decodeRoom({
      version: 'v',
      seed: 1,
      seats: [seat('a'), { ...seat('b'), team: { speciesIds: ['scp-682', 'scp-106'], equipment: [] } }],
      hashes: [['aaaaaaaa', 'aaaaaaaa'], ['aaaaaaaa', 'bbbbbbbb']],
    })!
    expect(hashMismatch(room)).toBe(1)
    expect(illegalSeats(room, ROSTER)).toEqual([1])
  })

  it('are null when gone or malformed', () => {
    expect(decodeRoom(null)).toBeNull()
    expect(decodeRoom({ seed: 1 })).toBeNull()
  })
})

describe('Room rules', () => {
  const rules = readFileSync('database.rules.json', 'utf8')

  it('accept exactly the codes and decisions the game produces', () => {
    expect(rules).toContain(`$code.matches(${ROOM_CODE_PATTERN.source.replace(/^/, '/')}/)`)
    expect(rules).toContain('newData.val().matches(/^[msr][0-5]$/)')
  })
})
