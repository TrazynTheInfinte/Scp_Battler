import type { Dex, ObjectClass } from './model'

export const TEAM_SIZE = 4
export const TEAM_BUDGET = 10
export const OBJECT_CLASS_COST: Readonly<Record<ObjectClass, number>> = {
  Safe: 1,
  Euclid: 2,
  Keter: 4,
}

export type TeamProblem =
  | { kind: 'size'; size: number }
  | { kind: 'unknown'; speciesId: string }
  | { kind: 'duplicate'; speciesId: string }
  | { kind: 'overBudget'; cost: number }

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
  return problems
}
