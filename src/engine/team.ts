import type { Dex, ObjectClass } from './model'

export const TEAM_SIZE = 6
export const TEAM_BUDGET = 15
export const OBJECT_CLASS_COST: Readonly<Record<ObjectClass, number>> = {
  Safe: 1,
  Euclid: 3,
  Keter: 4,
  /** Same cost as Keter, but fewer stats: a Thaumiel's strength is its counter ability. */
  Thaumiel: 4,
  /** Only ever one per team, backed by three Safe SCPs. */
  Apollyon: 6,
}

/** Class Limits (see GLOSSARY.md): the most SCPs of a class one team may include. */
export const CLASS_LIMIT: Readonly<Partial<Record<ObjectClass, number>>> = {
  Thaumiel: 1,
  Apollyon: 1,
}

export type TeamProblem =
  | { kind: 'size'; size: number }
  | { kind: 'unknown'; speciesId: string }
  | { kind: 'duplicate'; speciesId: string }
  | { kind: 'overBudget'; cost: number }
  | { kind: 'classLimit'; objectClass: ObjectClass; count: number }

/** Total object-class cost of a team (unknown species count as 0). */
export function teamCost(dex: Dex, speciesIds: readonly string[]): number {
  return speciesIds.reduce((sum, id) => {
    const sp = dex.species[id]
    return sum + (sp ? OBJECT_CLASS_COST[sp.objectClass] : 0)
  }, 0)
}

/** Every rule a team breaks; an empty array means the team is legal. */
export function validateTeam(dex: Dex, speciesIds: readonly string[]): TeamProblem[] {
  const problems: TeamProblem[] = []
  if (speciesIds.length !== TEAM_SIZE) problems.push({ kind: 'size', size: speciesIds.length })
  const seen = new Set<string>()
  for (const id of speciesIds) {
    if (!dex.species[id]) problems.push({ kind: 'unknown', speciesId: id })
    else if (seen.has(id)) problems.push({ kind: 'duplicate', speciesId: id })
    seen.add(id)
  }
  const cost = teamCost(dex, speciesIds)
  if (cost > TEAM_BUDGET) problems.push({ kind: 'overBudget', cost })
  for (const [objectClass, limit] of Object.entries(CLASS_LIMIT) as [ObjectClass, number][]) {
    const count = speciesIds.filter((id) => dex.species[id]?.objectClass === objectClass).length
    if (count > limit) problems.push({ kind: 'classLimit', objectClass, count })
  }
  return problems
}
