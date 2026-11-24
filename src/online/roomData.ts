import { validateTeam, type Dex } from '../engine'
import type { MatchLog, MatchSetup, Outcome, Seat } from './lockstep'

/** Pure helpers for what a Room stores; kept apart from Firebase so they can be tested. */

/** No I, O, 0, or 1: easy to read aloud and to type on a phone. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 6
export const ROOM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/

export function newRoomCode(random: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += ALPHABET[Math.floor(random() * ALPHABET.length)]
  return code
}

/** What a player typed, as a Room Code if it could be one (case and stray spaces/dashes ignored). */
export function parseRoomCode(input: string): string | null {
  const code = input.toUpperCase().replace(/[\s-]/g, '')
  return ROOM_CODE_PATTERN.test(code) ? code : null
}

export interface SeatData {
  uid: string
  callsign: string
  team: string[]
  equipment: (string | null)[]
  /** The lead picked in Team Preview, once picked. */
  lead: number | null
  /** Connected right now (Firebase presence). */
  online: boolean
  /** Has seen the battle's end; the Room is deleted once both have. */
  done: boolean
}

export interface RoomData {
  /** The build that created the Room; both players must run the same one. */
  version: string
  seed: number
  seats: [SeatData | null, SeatData | null]
  log: MatchLog
  /** hashes[k][seat]: that browser's hashState after applying decision point k. */
  hashes: (readonly [string | null, string | null])[]
}

/** The database returns keyed children as an array (with holes as null) or an object; either way, by index. */
function byIndex(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const out: unknown[] = []
  if (typeof raw === 'object' && raw !== null) {
    for (const [k, v] of Object.entries(raw)) if (/^\d+$/.test(k)) out[Number(k)] = v
  }
  return out
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null)

function pair(raw: unknown): [string | null, string | null] {
  const a = byIndex(raw)
  return [str(a[0]), str(a[1])]
}

function decodeSeat(raw: unknown): SeatData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const team = (r.team ?? {}) as Record<string, unknown>
  const ids = byIndex(team.speciesIds)
  if (typeof r.uid !== 'string' || typeof r.callsign !== 'string' || !ids.every((id) => typeof id === 'string')) {
    return null
  }
  const equipment = byIndex(team.equipment)
  return {
    uid: r.uid,
    callsign: r.callsign,
    team: ids as string[],
    equipment: ids.map((_, i) => (typeof equipment[i] === 'string' && equipment[i] !== '' ? (equipment[i] as string) : null)),
    lead: typeof r.lead === 'number' ? r.lead : null,
    online: r.online === true,
    done: r.done === true,
  }
}

function decodeOutcome(raw: unknown): Outcome | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (r.kind === 'noContest') return { kind: 'noContest' }
  if ((r.kind === 'forfeit' || r.kind === 'abandoned') && (r.seat === 0 || r.seat === 1) && typeof r.atStep === 'number') {
    return { kind: r.kind, seat: r.seat, atStep: r.atStep }
  }
  return null
}

/** A Room as stored, or null if it's gone or unreadable. */
export function decodeRoom(raw: unknown): RoomData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.version !== 'string' || typeof r.seed !== 'number') return null
  const seats = byIndex(r.seats)
  return {
    version: r.version,
    seed: r.seed,
    seats: [decodeSeat(seats[0]), decodeSeat(seats[1])],
    log: { decisions: Array.from(byIndex(r.steps), pair), outcome: decodeOutcome(r.outcome) },
    hashes: Array.from(byIndex(r.hashes), pair),
  }
}

/** The battle's setup once both players have picked leads; null before. */
export function matchSetup(room: RoomData): MatchSetup | null {
  const [a, b] = room.seats
  if (!a || !b || a.lead === null || b.lead === null) return null
  return { seed: room.seed, teams: [a.team, b.team], equipment: [a.equipment, b.equipment], leads: [a.lead, b.lead] }
}

/** Seats whose team breaks the Team Rules (only possible from a modified client). */
export function illegalSeats(room: RoomData, dex: Dex): Seat[] {
  return ([0, 1] as const).filter((s) => {
    const seat = room.seats[s]
    return seat !== null && validateTeam(dex, seat.team, seat.equipment).length > 0
  })
}

/** The first decision point where the two browsers' hashes disagree, or null. */
export function hashMismatch(room: RoomData): number | null {
  const k = room.hashes.findIndex((h) => h && h[0] !== null && h[1] !== null && h[0] !== h[1])
  return k >= 0 ? k : null
}
