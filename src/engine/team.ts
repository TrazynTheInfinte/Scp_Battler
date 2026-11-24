import type { Dex, ObjectClass } from './model'

export const TEAM_SIZE = 6
export const TEAM_BUDGET = 15
/**
 * Equipment Allowance (see GLOSSARY.md): extra points every team gets that
 * can only buy Equipment, on top of whatever Team Budget its SCPs leave over.
 */
export const EQUIPMENT_ALLOWANCE = 2
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
  /**
   * Added in wave 6: three Keters plus three Safes was the one makeup that
   * kept breaking the 70% limit as the roster grew (see docs/adr/0003).
   */
  Keter: 2,
}

export type TeamProblem =
  | { kind: 'size'; size: number }
  | { kind: 'unknown'; speciesId: string }
  | { kind: 'duplicate'; speciesId: string }
  | { kind: 'overBudget'; cost: number }
  | { kind: 'classLimit'; objectClass: ObjectClass; count: number }
  /** More Equipment entries than SCPs. */
  | { kind: 'equipmentSlots'; count: number }
  | { kind: 'unknownEquipment'; equipmentId: string }
  | { kind: 'duplicateEquipment'; equipmentId: string }
  /** Equipment costs more than the allowance plus the SCPs' leftover budget. */
  | { kind: 'equipmentOverBudget'; cost: number; available: number }

/** Total object-class cost of a team (unknown species count as 0). */
export function teamCost(dex: Dex, speciesIds: readonly string[]): number {
  return speciesIds.reduce((sum, id) => {
    const sp = dex.species[id]
    return sum + (sp ? OBJECT_CLASS_COST[sp.objectClass] : 0)
  }, 0)
}

/** Total cost of a team's Equipment (empty slots and unknown ids count as 0). */
export function equipmentCost(dex: Dex, equipment: readonly (string | null)[]): number {
  return equipment.reduce((sum, id) => sum + (id ? (dex.equipment[id]?.cost ?? 0) : 0), 0)
}

/** Points a team can spend on Equipment: the allowance plus whatever its SCPs leave of the budget. */
export function equipmentBudget(dex: Dex, speciesIds: readonly string[]): number {
  return EQUIPMENT_ALLOWANCE + Math.max(0, TEAM_BUDGET - teamCost(dex, speciesIds))
}

/**
 * Every rule a team breaks; an empty array means the team is legal.
 * `equipment` is aligned with `speciesIds` (null or missing = none).
 */
export function validateTeam(
  dex: Dex,
  speciesIds: readonly string[],
  equipment: readonly (string | null)[] = [],
): TeamProblem[] {
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

  if (equipment.length > speciesIds.length) problems.push({ kind: 'equipmentSlots', count: equipment.length })
  const carried = new Set<string>()
  for (const id of equipment) {
    if (id === null) continue
    if (!dex.equipment[id]) problems.push({ kind: 'unknownEquipment', equipmentId: id })
    else if (carried.has(id)) problems.push({ kind: 'duplicateEquipment', equipmentId: id })
    carried.add(id)
  }
  const gear = equipmentCost(dex, equipment)
  const available = equipmentBudget(dex, speciesIds)
  if (gear > available) problems.push({ kind: 'equipmentOverBudget', cost: gear, available })
  return problems
}
