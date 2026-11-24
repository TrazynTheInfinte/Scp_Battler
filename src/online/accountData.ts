import type { Dex } from '../engine'
import { parseTeams, type SavedTeam } from '../ui/savedTeams'

/** Pure helpers for what an Account stores; kept apart from Firebase so they can be tested. */

export const CALLSIGN_MIN = 3
export const CALLSIGN_MAX = 16

/** The trimmed Callsign, or why it can't be used. */
export function checkCallsign(raw: string): { ok: true; callsign: string } | { ok: false; reason: string } {
  const callsign = raw.trim().replace(/\s+/g, ' ')
  if (callsign.length < CALLSIGN_MIN || callsign.length > CALLSIGN_MAX) {
    return { ok: false, reason: `Callsigns are ${CALLSIGN_MIN}–${CALLSIGN_MAX} characters.` }
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(callsign)) return { ok: false, reason: 'Letters, numbers, and punctuation only.' }
  return { ok: true, callsign }
}

/** A starting Callsign from the Google display name: its first word, if that makes a valid one. */
export function suggestCallsign(displayName: string | null | undefined): string {
  const first = (displayName ?? '').trim().split(/\s+/)[0].slice(0, CALLSIGN_MAX)
  return checkCallsign(first).ok ? first : ''
}

/**
 * A saved team as the database stores it. The Realtime Database drops nulls
 * and turns arrays into keyed objects, so "no Equipment" is '' rather than null.
 */
export interface StoredTeam {
  name: string
  speciesIds: string[]
  equipment: string[]
}

export function encodeTeams(teams: readonly SavedTeam[]): StoredTeam[] {
  return teams.map((t) => ({
    name: t.name,
    speciesIds: [...t.speciesIds],
    equipment: t.speciesIds.map((_, i) => t.equipment?.[i] ?? ''),
  }))
}

/** Whatever the database returned for a teams list, back to saved teams; anything malformed is dropped. */
export function decodeTeams(raw: unknown, dex: Dex): SavedTeam[] {
  const list = asArray(raw).map((t) => {
    if (typeof t !== 'object' || t === null) return t
    const { name, speciesIds, equipment } = t as Record<string, unknown>
    const ids = asArray(speciesIds)
    return {
      name,
      speciesIds: ids,
      equipment: ids.map((_, i) => {
        const e = asArray(equipment)[i]
        return e === '' || e === undefined ? null : e
      }),
    }
  })
  return parseTeams(list, dex)
}

/** The database returns small arrays as arrays, but may return them as {"0": …, "1": …}. */
function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && raw !== null) {
    return Object.entries(raw)
      .filter(([k]) => /^\d+$/.test(k))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v)
  }
  return []
}
