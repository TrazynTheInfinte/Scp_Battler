import { ROSTER } from '../data/roster'
import { browserStorage, loadTeams, mergeTeams, parseTeams, writeTeams, type SavedTeam } from '../ui/savedTeams'
import { checkCallsign, decodeGrants, decodeTeams, encodeTeams, suggestCallsign } from './accountData'
import { loadFirebase, type Firebase } from './firebase'

/**
 * The signed-in Account (see GLOSSARY.md), as a small external store for
 * React's useSyncExternalStore.
 *
 * While signed in, this browser keeps a copy of the Account's Callsign and
 * Saved Teams under CACHE_KEY. The copy lets a returning player see their
 * teams before Firebase answers (or while offline), and its presence is how
 * we know to load Firebase at all on startup: a player who never signed in
 * never downloads it. Signing out deletes the copy.
 */

export type AccountState =
  | { status: 'signedOut'; notice: string | null }
  | {
      status: 'signedIn'
      uid: string
      /** null until the player picks one (first sign-in). */
      callsign: string | null
      /** Pre-fill for the Callsign form, from the Google name. */
      suggestedCallsign: string
      teams: SavedTeam[]
      /** Gift SCPs this Account holds a Grant for (set by hand in the Firebase console). */
      grants: string[]
      /** Connected to the database right now; saving is paused while false. */
      online: boolean
      /** The database has answered at least once this session (else `teams` is the cached copy). */
      loaded: boolean
      notice: string | null
    }

type SignedIn = Extract<AccountState, { status: 'signedIn' }>

const CACHE_KEY = 'scp-battler:account:v1'

interface Cache {
  uid: string
  callsign: string | null
  teams: SavedTeam[]
  grants: string[]
}

function readCache(): Cache | null {
  try {
    const raw = JSON.parse(browserStorage()?.getItem(CACHE_KEY) ?? 'null') as Partial<Cache> | null
    if (!raw || typeof raw.uid !== 'string') return null
    return {
      uid: raw.uid,
      callsign: typeof raw.callsign === 'string' ? raw.callsign : null,
      teams: parseTeams(raw.teams, ROSTER),
      grants: Array.isArray(raw.grants) ? raw.grants.filter((id): id is string => typeof id === 'string' && ROSTER.species[id]?.gift !== undefined) : [],
    }
  } catch {
    return null
  }
}

function writeCache(cache: Cache | null) {
  try {
    if (cache) localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    else localStorage.removeItem(CACHE_KEY)
  } catch {
    // The copy is a convenience; the Account itself is unaffected.
  }
}

// --- the store ---

const cached = readCache()
let state: AccountState = cached
  ? {
      status: 'signedIn',
      ...cached,
      suggestedCallsign: '',
      online: false,
      loaded: false,
      notice: null,
    }
  : { status: 'signedOut', notice: null }
const listeners = new Set<() => void>()

function setState(next: AccountState) {
  state = next
  if (next.status === 'signedIn') writeCache({ uid: next.uid, callsign: next.callsign, teams: next.teams, grants: next.grants })
  else writeCache(null)
  for (const l of listeners) l()
}

function patch(changes: Partial<SignedIn>) {
  if (state.status === 'signedIn') setState({ ...state, ...changes })
}

export const accountStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): AccountState => state,
}

// --- Firebase wiring ---

let connecting: Promise<Firebase> | null = null
let unsubscribeData: (() => void) | null = null

/** Load Firebase and follow the auth state. Safe to call repeatedly. */
function connect(): Promise<Firebase> {
  connecting ??= loadFirebase().then((fb) => {
    fb.authApi.onAuthStateChanged(fb.auth, (user) => {
      unsubscribeData?.()
      unsubscribeData = null
      if (!user) {
        if (state.status === 'signedIn') setState({ status: 'signedOut', notice: null })
        return
      }
      const keep = state.status === 'signedIn' && state.uid === user.uid ? state : null
      setState({
        status: 'signedIn',
        uid: user.uid,
        callsign: keep?.callsign ?? null,
        suggestedCallsign: suggestCallsign(user.displayName),
        teams: keep?.teams ?? [],
        grants: keep?.grants ?? [],
        online: false,
        loaded: false,
        notice: keep?.notice ?? null,
      })
      unsubscribeData = follow(fb, user.uid)
    })
    return fb
  })
  connecting.catch(() => {
    connecting = null
    patch({ notice: "Couldn't reach the game's servers. Check your connection." })
  })
  return connecting
}

/** Keep the store in step with the Account's data and the connection. */
function follow(fb: Firebase, uid: string): () => void {
  const { dbApi, db } = fb
  const offUser = dbApi.onValue(
    dbApi.ref(db, `users/${uid}`),
    (snap) => {
      const val = (snap.val() ?? {}) as { callsign?: unknown; teams?: unknown }
      patch({
        callsign: typeof val.callsign === 'string' ? val.callsign : null,
        teams: decodeTeams(val.teams, ROSTER),
        loaded: true,
      })
    },
    () => patch({ notice: "Couldn't load your Account. Try signing out and in again." }),
  )
  // Readable only by its owner, and never writable from the game (database.rules.json).
  const offGrants = dbApi.onValue(
    dbApi.ref(db, `grants/${uid}`),
    (snap) => patch({ grants: decodeGrants(snap.val(), ROSTER) }),
    // No Grants (or rules not published yet): just no Gift SCPs.
    () => patch({ grants: [] }),
  )
  const offConnected = dbApi.onValue(dbApi.ref(db, '.info/connected'), (snap) => patch({ online: snap.val() === true }))
  return () => {
    offUser()
    offGrants()
    offConnected()
  }
}

// Returning player: pick the session back up.
if (cached) void connect().catch(() => {})

// --- actions ---

const POPUP_ERRORS: Record<string, string | null> = {
  'auth/popup-closed-by-user': null,
  'auth/cancelled-popup-request': null,
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': "Couldn't reach Google. Check your connection.",
  'auth/unauthorized-domain': "Sign-in isn't set up for this address yet.",
}

/**
 * Sign in with Google, then merge this browser's Saved Teams into the
 * Account: they move to the Account, except any that don't fit, which stay here.
 * Resolves to an error message, or null (also null if the player closed the window).
 */
export async function signIn(): Promise<string | null> {
  let fb: Firebase
  try {
    fb = await connect()
  } catch {
    return "Couldn't reach the game's servers. Check your connection."
  }
  let uid: string
  try {
    const cred = await fb.authApi.signInWithPopup(fb.auth, new fb.authApi.GoogleAuthProvider())
    uid = cred.user.uid
  } catch (e) {
    const code = (e as { code?: string }).code ?? ''
    return code in POPUP_ERRORS ? POPUP_ERRORS[code] : `Sign-in failed (${code || 'unknown error'}).`
  }
  try {
    await uploadLocalTeams(fb, uid)
  } catch {
    patch({ notice: "Signed in, but this browser's teams couldn't be copied to your Account. They're still here." })
  }
  return null
}

async function uploadLocalTeams(fb: Firebase, uid: string) {
  const storage = browserStorage()
  const local = loadTeams(storage, ROSTER)
  if (local.length === 0) return
  const { dbApi, db } = fb
  const teamsRef = dbApi.ref(db, `users/${uid}/teams`)
  const account = decodeTeams((await dbApi.get(teamsRef)).val(), ROSTER)
  const { teams, uploaded, leftover } = mergeTeams(account, local)
  if (teams.length !== account.length) await dbApi.set(teamsRef, encodeTeams(teams))
  writeTeams(storage, leftover)
  if (leftover.length > 0) {
    patch({
      notice:
        `Your Account is full, so ${leftover.map((t) => `"${t.name}"`).join(', ')} stayed in this browser` +
        ` (sign out to see ${leftover.length === 1 ? 'it' : 'them'}).` +
        (uploaded.length > 0 ? ` Moved ${uploaded.length} to your Account.` : ''),
    })
  }
}

export async function signOut(): Promise<void> {
  try {
    const fb = await connect()
    await fb.authApi.signOut(fb.auth)
  } finally {
    // Even if Firebase is unreachable, this device forgets the Account.
    setState({ status: 'signedOut', notice: null })
  }
}

/** Set the Callsign. Resolves to an error message, or null. */
export async function setCallsign(raw: string): Promise<string | null> {
  if (state.status !== 'signedIn') return 'Sign in first.'
  if (!state.online) return "You're offline. Try again when you're connected."
  const checked = checkCallsign(raw)
  if (!checked.ok) return checked.reason
  const { uid } = state
  try {
    const { dbApi, db } = await connect()
    await dbApi.set(dbApi.ref(db, `users/${uid}/callsign`), checked.callsign)
    return null
  } catch {
    return "Couldn't save your Callsign. Try again."
  }
}

/** Replace the Account's Saved Teams. Fails while offline (saving is paused, not queued). */
export async function saveAccountTeams(teams: SavedTeam[]): Promise<'ok' | 'offline' | 'error'> {
  if (state.status !== 'signedIn') return 'error'
  if (!state.online) return 'offline'
  const { uid } = state
  try {
    const { dbApi, db } = await connect()
    await dbApi.set(dbApi.ref(db, `users/${uid}/teams`), encodeTeams(teams))
    patch({ teams })
    return 'ok'
  } catch {
    return 'error'
  }
}

export function dismissAccountNotice() {
  if (state.status === 'signedIn') patch({ notice: null })
  else setState({ status: 'signedOut', notice: null })
}
