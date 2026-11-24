import { validateTeam, type Dex } from '../engine'

/**
 * Saved Teams (see GLOSSARY.md). The list logic here is pure; where a list
 * lives is the caller's business: this browser's localStorage when signed out
 * (helpers below), or the Account when signed in (src/online/account.ts).
 * Every localStorage access is guarded: storage can be missing, full, or
 * blocked (private mode), and the app must work without it.
 */

export const MAX_SAVED_TEAMS = 5
export const MAX_NAME_LENGTH = 24
const KEY = 'scp-battler:teams:v1'

export interface SavedTeam {
  name: string
  speciesIds: string[]
  /** Aligned with `speciesIds`; missing in teams saved before Equipment existed. */
  equipment?: (string | null)[]
}

/** Problems a saved team may have and still load, so the player can see and fix them (e.g. after a cost change). */
const FIXABLE = new Set(['overBudget', 'equipmentOverBudget'])

/** Keep only well-formed, loadable teams (at most MAX_SAVED_TEAMS), silently dropping the rest. */
export function parseTeams(raw: unknown, dex: Dex): SavedTeam[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (t): t is SavedTeam =>
        typeof t === 'object' &&
        t !== null &&
        typeof t.name === 'string' &&
        Array.isArray(t.speciesIds) &&
        t.speciesIds.every((id: unknown) => typeof id === 'string') &&
        (t.equipment === undefined ||
          (Array.isArray(t.equipment) && t.equipment.every((id: unknown) => id === null || typeof id === 'string'))) &&
        validateTeam(dex, t.speciesIds, t.equipment).every((p) => FIXABLE.has(p.kind)),
    )
    .slice(0, MAX_SAVED_TEAMS)
}

export type EditResult =
  | { ok: true; teams: SavedTeam[] }
  | { ok: false; reason: 'emptyName' | 'full' | 'illegal' }

/** Add a team, or overwrite the one with the same name; a new name needs a free slot. */
export function upsertTeam(
  teams: readonly SavedTeam[],
  dex: Dex,
  name: string,
  speciesIds: readonly string[],
  equipment: readonly (string | null)[] = [],
): EditResult {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
  if (!trimmed) return { ok: false, reason: 'emptyName' }
  if (validateTeam(dex, speciesIds, equipment).length > 0) return { ok: false, reason: 'illegal' }
  const entry = { name: trimmed, speciesIds: [...speciesIds], equipment: speciesIds.map((_, i) => equipment[i] ?? null) }
  const next = [...teams]
  const existing = next.findIndex((t) => t.name === trimmed)
  if (existing >= 0) next[existing] = entry
  else if (next.length >= MAX_SAVED_TEAMS) return { ok: false, reason: 'full' }
  else next.push(entry)
  return { ok: true, teams: next }
}

export function removeTeam(teams: readonly SavedTeam[], name: string): SavedTeam[] {
  return teams.filter((t) => t.name !== name)
}

const sameTeam = (a: SavedTeam, b: SavedTeam) =>
  a.speciesIds.join() === b.speciesIds.join() &&
  a.speciesIds.every((_, i) => (a.equipment?.[i] ?? null) === (b.equipment?.[i] ?? null))

/** `name`, or `name (2)`, `name (3)`… — the first not taken, kept within MAX_NAME_LENGTH. */
function freeName(name: string, taken: ReadonlySet<string>): string {
  if (!taken.has(name)) return name
  for (let n = 2; ; n++) {
    const suffix = ` (${n})`
    const candidate = name.slice(0, MAX_NAME_LENGTH - suffix.length) + suffix
    if (!taken.has(candidate)) return candidate
  }
}

/**
 * Merge this browser's teams into an Account's on sign-in. Nothing is
 * overwritten: a clashing name gets a " (2)" suffix, and an exact copy of a
 * team the Account already has counts as uploaded. Teams that don't fit under
 * the cap are `leftover` and stay in the browser.
 */
export function mergeTeams(
  account: readonly SavedTeam[],
  local: readonly SavedTeam[],
): { teams: SavedTeam[]; uploaded: SavedTeam[]; leftover: SavedTeam[] } {
  const teams = [...account]
  const uploaded: SavedTeam[] = []
  const leftover: SavedTeam[] = []
  for (const t of local) {
    if (teams.some((a) => a.name === t.name && sameTeam(a, t))) uploaded.push(t)
    else if (teams.length >= MAX_SAVED_TEAMS) leftover.push(t)
    else {
      teams.push({ ...t, name: freeName(t.name, new Set(teams.map((a) => a.name))) })
      uploaded.push(t)
    }
  }
  return { teams, uploaded, leftover }
}

// --- this browser's list (localStorage) ---

/** The subset of Storage we use, so tests can pass a fake. */
export type TeamStorage = Pick<Storage, 'getItem' | 'setItem'>

export function browserStorage(): TeamStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** Load this browser's saved teams, silently dropping anything malformed. Teams that are only over budget are kept. */
export function loadTeams(storage: TeamStorage | null, dex: Dex): SavedTeam[] {
  if (!storage) return []
  try {
    return parseTeams(JSON.parse(storage.getItem(KEY) ?? '[]'), dex)
  } catch {
    return []
  }
}

export type SaveResult = EditResult | { ok: false; reason: 'storage' | 'offline' }

/**
 * Save a team under a name. Saving under an existing name overwrites it;
 * otherwise a new slot is used if one is free.
 */
export function saveTeam(
  storage: TeamStorage | null,
  dex: Dex,
  name: string,
  speciesIds: readonly string[],
  equipment: readonly (string | null)[] = [],
): SaveResult {
  const result = upsertTeam(loadTeams(storage, dex), dex, name, speciesIds, equipment)
  if (!result.ok) return result
  return writeTeams(storage, result.teams)
}

export function deleteTeam(storage: TeamStorage | null, dex: Dex, name: string): SaveResult {
  return writeTeams(storage, removeTeam(loadTeams(storage, dex), name))
}

/** Replace this browser's whole list. */
export function writeTeams(storage: TeamStorage | null, teams: SavedTeam[]): SaveResult {
  if (!storage) return { ok: false, reason: 'storage' }
  try {
    storage.setItem(KEY, JSON.stringify(teams))
    return { ok: true, teams }
  } catch {
    return { ok: false, reason: 'storage' }
  }
}
