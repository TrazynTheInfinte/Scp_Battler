import { loadFirebase, type Firebase } from './firebase'
import type { Outcome, Seat } from './lockstep'
import { decodeRoom, newRoomCode, type RoomData } from './roomData'

/**
 * Rooms in the Realtime Database (see database.rules.json):
 *
 *   rooms/<code>     version, seed, createdAt, seats/<0|1>, steps/<k>/<seat>, hashes/<k>/<seat>, outcome
 *   roomAges/<code>  createdAt, so stale Rooms can be found and swept without reading every Room
 *
 * Each player writes only their own seat's entries; the rules enforce it.
 */

/** This build's id; a Room only accepts players on the build that created it. */
export const BUILD_ID: string = import.meta.env.VITE_BUILD_ID ?? 'dev'

/** Rooms untouched this long are swept when someone next creates a Room. */
const STALE_MS = 24 * 60 * 60 * 1000
/** Slack for clock differences between this browser and the server. */
const CLOCK_SLACK_MS = 60 * 60 * 1000

const CURRENT_KEY = 'scp-battler:room:v1'

/** The Room this browser is in, remembered so a reload rejoins it. */
export interface CurrentRoom {
  code: string
  seat: Seat
}

export function rememberedRoom(): CurrentRoom | null {
  try {
    const raw = JSON.parse(localStorage.getItem(CURRENT_KEY) ?? 'null') as Partial<CurrentRoom> | null
    return raw && typeof raw.code === 'string' && (raw.seat === 0 || raw.seat === 1)
      ? { code: raw.code, seat: raw.seat }
      : null
  } catch {
    return null
  }
}

function remember(room: CurrentRoom | null) {
  try {
    if (room) localStorage.setItem(CURRENT_KEY, JSON.stringify(room))
    else localStorage.removeItem(CURRENT_KEY)
  } catch {
    // Only costs the automatic rejoin after a reload.
  }
}

export const forgetRoom = () => remember(null)

/** Who is entering a Room, with what. */
export interface Entrant {
  uid: string
  callsign: string
  team: readonly string[]
  equipment: readonly (string | null)[]
}

function seatFor(e: Entrant) {
  return {
    uid: e.uid,
    callsign: e.callsign,
    team: { speciesIds: [...e.team], equipment: e.team.map((_, i) => e.equipment[i] ?? '') },
    online: true,
  }
}

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const OFFLINE = "Couldn't reach the game's servers. Check your connection."

/** Create a Room as seat 0. Tries a few codes in case one is taken. */
export async function createRoom(entrant: Entrant): Promise<Result<{ code: string }>> {
  let fb: Firebase
  try {
    fb = await loadFirebase()
  } catch {
    return { ok: false, error: OFFLINE }
  }
  void sweepStaleRooms(fb)
  const { dbApi, db } = fb
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newRoomCode()
    try {
      // The rules refuse to overwrite an existing Room, so a taken code fails here.
      await dbApi.set(dbApi.ref(db, `rooms/${code}`), {
        version: BUILD_ID,
        seed: Math.floor(Math.random() * 0x100000000),
        createdAt: dbApi.serverTimestamp(),
        seats: { 0: seatFor(entrant) },
      })
      await dbApi.set(dbApi.ref(db, `roomAges/${code}`), dbApi.serverTimestamp())
      remember({ code, seat: 0 })
      return { ok: true, code }
    } catch {
      // Taken (or offline); try another code.
    }
  }
  return { ok: false, error: "Couldn't create a Room. Check your connection and try again." }
}

/** Join a Room as seat 1 (or rejoin the seat this Account already holds). */
export async function joinRoom(code: string, entrant: Entrant): Promise<Result<{ seat: Seat }>> {
  let fb: Firebase
  try {
    fb = await loadFirebase()
  } catch {
    return { ok: false, error: OFFLINE }
  }
  const { dbApi, db } = fb
  let room: RoomData | null
  try {
    room = decodeRoom((await dbApi.get(dbApi.ref(db, `rooms/${code}`))).val())
  } catch {
    return { ok: false, error: OFFLINE }
  }
  if (!room) return { ok: false, error: 'No Room has that code. Check it with your friend.' }
  for (const seat of [0, 1] as const) {
    if (room.seats[seat]?.uid === entrant.uid) {
      remember({ code, seat })
      return { ok: true, seat }
    }
  }
  if (room.version !== BUILD_ID) {
    return {
      ok: false,
      error: 'That Room was made on a different version of the game. Both of you refresh the page, then make a new Room.',
    }
  }
  if (room.seats[1]) return { ok: false, error: 'That Room is already full.' }
  try {
    await dbApi.set(dbApi.ref(db, `rooms/${code}/seats/1`), seatFor(entrant))
  } catch {
    return { ok: false, error: 'That Room is already full.' }
  }
  remember({ code, seat: 1 })
  return { ok: true, seat: 1 }
}

/**
 * Follow a Room: `onRoom` gets every change (null once it's deleted). While
 * watching, this seat is marked online, and offline again if the connection
 * drops (Firebase presence). Returns a function that stops watching.
 */
export function watchRoom(code: string, seat: Seat, onRoom: (room: RoomData | null) => void): () => void {
  let stopped = false
  let stop = () => {
    stopped = true
  }
  void loadFirebase().then(({ dbApi, db }) => {
    if (stopped) return
    const online = dbApi.ref(db, `rooms/${code}/seats/${seat}/online`)
    const offRoom = dbApi.onValue(dbApi.ref(db, `rooms/${code}`), (snap) => onRoom(decodeRoom(snap.val())))
    const offConnected = dbApi.onValue(dbApi.ref(db, '.info/connected'), (snap) => {
      if (snap.val() !== true) return
      // Fails harmlessly once the Room is gone (the rules need a seat to write to).
      dbApi
        .onDisconnect(online)
        .set(false)
        .then(() => dbApi.set(online, true))
        .catch(() => {})
    })
    stop = () => {
      offRoom()
      offConnected()
      dbApi.onDisconnect(online).cancel().catch(() => {})
      dbApi.set(online, false).catch(() => {})
    }
  })
  return () => stop()
}

async function write(path: string, value: unknown): Promise<boolean> {
  try {
    const { dbApi, db } = await loadFirebase()
    await dbApi.set(dbApi.ref(db, path), value)
    return true
  } catch {
    return false
  }
}

export const submitLead = (code: string, seat: Seat, lead: number) => write(`rooms/${code}/seats/${seat}/lead`, lead)

export const submitDecision = (code: string, step: number, seat: Seat, decision: string) =>
  write(`rooms/${code}/steps/${step}/${seat}`, decision)

export const submitHash = (code: string, step: number, seat: Seat, hash: string) =>
  write(`rooms/${code}/hashes/${step}/${seat}`, hash)

/** Record how the battle ended off the board. Only the first outcome sticks (the rules make it write-once). */
export const recordOutcome = (code: string, outcome: Outcome) => write(`rooms/${code}/outcome`, outcome)

/** This seat has seen the end; the second player to get here deletes the Room. */
export async function finishRoom(code: string, seat: Seat, room: RoomData | null) {
  forgetRoom()
  if (!room || room.seats[seat === 0 ? 1 : 0]?.done !== false) await deleteRoom(code)
  else await write(`rooms/${code}/seats/${seat}/done`, true)
}

/** Delete a Room (e.g. the creator cancels before anyone joins). */
export async function deleteRoom(code: string) {
  forgetRoom()
  try {
    const { dbApi, db } = await loadFirebase()
    await dbApi.remove(dbApi.ref(db, `rooms/${code}`))
    await dbApi.remove(dbApi.ref(db, `roomAges/${code}`))
  } catch {
    // Left for the stale-Room sweep.
  }
}

/** There's no server to run cleanup, so creating a Room sweeps a few abandoned ones. */
async function sweepStaleRooms({ dbApi, db }: Firebase) {
  try {
    const cutoff = Date.now() - STALE_MS - CLOCK_SLACK_MS
    const stale = await dbApi.get(
      dbApi.query(dbApi.ref(db, 'roomAges'), dbApi.orderByValue(), dbApi.endAt(cutoff), dbApi.limitToFirst(10)),
    )
    const codes = Object.keys((stale.val() ?? {}) as object)
    await Promise.all(
      codes.map(async (code) => {
        await dbApi.remove(dbApi.ref(db, `rooms/${code}`)).catch(() => {})
        await dbApi.remove(dbApi.ref(db, `roomAges/${code}`)).catch(() => {})
      }),
    )
  } catch {
    // Best effort.
  }
}
