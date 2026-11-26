import type { Update } from '../data/updates'

/**
 * Which Updates a player hasn't seen yet, remembered per browser (an Account
 * isn't needed). A first visit shows nothing: the player is marked up to date.
 */
const KEY = 'scp-battler:update-seen:v1'
const PREFIX = 'scp-battler:'
/** At most this many unseen Updates show at once, newest first. */
export const MAX_SHOWN = 5

/**
 * `lastSeen`: the id stored by an earlier visit, or null. `returning`: the
 * browser holds other game data, so it played before Updates existed.
 */
export function unseenUpdates(updates: readonly Update[], lastSeen: string | null, returning: boolean): Update[] {
  if (lastSeen === null) return returning ? updates.slice(0, 1) : []
  const i = updates.findIndex((u) => u.id === lastSeen)
  // An id we no longer list: just the newest, rather than everything.
  return (i === -1 ? updates.slice(0, 1) : updates.slice(0, i)).slice(0, MAX_SHOWN)
}

/**
 * The Updates to show on this visit. A first visit is marked up to date
 * right away; otherwise the caller marks them seen when the popup closes.
 */
export function takeUnseenUpdates(updates: readonly Update[]): Update[] {
  try {
    const lastSeen = localStorage.getItem(KEY)
    const returning = Object.keys(localStorage).some((k) => k.startsWith(PREFIX) && k !== KEY)
    const unseen = unseenUpdates(updates, lastSeen, returning)
    if (unseen.length === 0) markUpdatesSeen(updates)
    return unseen
  } catch {
    return [] // no storage: don't show it on every visit
  }
}

export function markUpdatesSeen(updates: readonly Update[]) {
  if (updates.length === 0) return
  try {
    localStorage.setItem(KEY, updates[0].id)
  } catch {
    // Only means the popup may show again.
  }
}
