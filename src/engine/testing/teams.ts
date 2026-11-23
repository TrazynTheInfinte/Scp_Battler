import type { Dex } from '../model'
import { OBJECT_CLASS_COST, TEAM_SIZE } from '../team'

/**
 * Test helper: fill `team` up to TEAM_SIZE with the Dex's cost-1 (Safe) SCPs
 * that aren't already on it, in Dex order. The given SCPs keep their
 * positions, so tests can keep indexing them; the padding sits on the bench.
 */
export function padTeam(dex: Dex, team: readonly string[]): string[] {
  const fillers = Object.values(dex.species)
    .filter((sp) => OBJECT_CLASS_COST[sp.objectClass] === 1 && !team.includes(sp.id))
    .map((sp) => sp.id)
  return [...team, ...fillers].slice(0, Math.max(TEAM_SIZE, team.length))
}
