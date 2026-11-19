import { validateTeam, type Dex } from '../engine'

/**
 * Saved teams live in this browser only (localStorage). Every access is
 * guarded: storage can be missing, full, or blocked (private mode), and the
 * app must work without it.
 */

export const MAX_SAVED_TEAMS = 5
export const MAX_NAME_LENGTH = 24
const KEY = 'scp-battler:teams:v1'

export interface SavedTeam {
  name: string
  speciesIds: string[]
}

/** The subset of Storage we use, so tests can pass a fake. */
export type TeamStorage = Pick<Storage, 'getItem' | 'setItem'>

export function browserStorage(): TeamStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** Load saved teams, silently dropping anything malformed or no longer legal. */
export function loadTeams(storage: TeamStorage | null, dex: Dex): SavedTeam[] {
  if (!storage) return []
  try {
    const raw = JSON.parse(storage.getItem(KEY) ?? '[]') as unknown
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (t): t is SavedTeam =>
          typeof t === 'object' &&
          t !== null &&
          typeof t.name === 'string' &&
          Array.isArray(t.speciesIds) &&
          t.speciesIds.every((id: unknown) => typeof id === 'string') &&
          validateTeam(dex, t.speciesIds).length === 0,
      )
      .slice(0, MAX_SAVED_TEAMS)
  } catch {
    return []
  }
}

export type SaveResult =
  | { ok: true; teams: SavedTeam[] }
  | { ok: false; reason: 'emptyName' | 'full' | 'illegal' | 'storage' }

/**
 * Save a team under a name. Saving under an existing name overwrites it;
 * otherwise a new slot is used if one is free.
 */
export function saveTeam(
  storage: TeamStorage | null,
  dex: Dex,
  name: string,
  speciesIds: readonly string[],
): SaveResult {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
  if (!trimmed) return { ok: false, reason: 'emptyName' }
  if (validateTeam(dex, speciesIds).length > 0) return { ok: false, reason: 'illegal' }
  if (!storage) return { ok: false, reason: 'storage' }
  const teams = loadTeams(storage, dex)
  const entry = { name: trimmed, speciesIds: [...speciesIds] }
  const existing = teams.findIndex((t) => t.name === trimmed)
  if (existing >= 0) teams[existing] = entry
  else if (teams.length >= MAX_SAVED_TEAMS) return { ok: false, reason: 'full' }
  else teams.push(entry)
  return write(storage, teams)
}

export function deleteTeam(storage: TeamStorage | null, dex: Dex, name: string): SaveResult {
  if (!storage) return { ok: false, reason: 'storage' }
  return write(
    storage,
    loadTeams(storage, dex).filter((t) => t.name !== name),
  )
}

function write(storage: TeamStorage, teams: SavedTeam[]): SaveResult {
  try {
    storage.setItem(KEY, JSON.stringify(teams))
    return { ok: true, teams }
  } catch {
    return { ok: false, reason: 'storage' }
  }
}
