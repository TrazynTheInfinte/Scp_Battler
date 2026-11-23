import type { Dex, ObjectClass, TypeName } from '../engine'

/** The Team Builder's search box and filter checkboxes. */
export interface RosterFilter {
  /** Matches the SCP's number, name, or nickname (case-insensitive). */
  query: string
  /** Show SCPs with any of these types; empty = any type. */
  types: ReadonlySet<TypeName>
  /** Show SCPs of any of these object classes; empty = any class. */
  classes: ReadonlySet<ObjectClass>
}

export const NO_FILTER: RosterFilter = { query: '', types: new Set(), classes: new Set() }

export const isFiltering = (f: RosterFilter) => f.query.trim() !== '' || f.types.size > 0 || f.classes.size > 0

/**
 * The roster ids (in their given order) that pass every filter group. Within
 * a group any ticked option may match; across groups all must match.
 */
export function filterRoster(
  dex: Dex,
  order: readonly string[],
  nicknames: Readonly<Record<string, { nickname: string }>>,
  filter: RosterFilter,
): string[] {
  const q = filter.query.trim().toLowerCase()
  return order.filter((id) => {
    const sp = dex.species[id]
    if (filter.types.size > 0 && !sp.types.some((t) => filter.types.has(t))) return false
    if (filter.classes.size > 0 && !filter.classes.has(sp.objectClass)) return false
    if (q === '') return true
    const haystack = [id, sp.name, nicknames[id]?.nickname ?? ''].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
