import { OBJECT_CLASS_COST, type Dex, type MoveData, type SpeciesData } from '../engine'
import { ABILITIES } from './abilities'
import { MOVE_POOL } from './moves'
import type { ScpDefinition } from './scp'
import { CLASS_STAT_TOTAL, templateStats } from './statTemplates'

/**
 * The roster: every file in scps/ is one SCP, picked up automatically.
 * Adding an SCP means adding a file there; nothing else needs listing.
 *
 * SCP names and concepts are from the SCP Wiki (CC BY-SA 3.0); see each
 * file's dossier for per-article credits. Move and ability names are original.
 */
const files = import.meta.glob<{ default: ScpDefinition }>('./scps/*.ts', { eager: true })

/** Every SCP definition, keyed by the file it came from (e.g. './scps/scp-173.ts'). */
export const SCP_FILES: Readonly<Record<string, ScpDefinition>> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path, mod.default]),
)

const number = (id: string) => Number(id.replace(/^scp-/, ''))

/** Every SCP definition, in display order: cheapest object class first, then by number. */
export const SCPS: readonly ScpDefinition[] = Object.values(SCP_FILES).sort(
  (a, b) => OBJECT_CLASS_COST[a.objectClass] - OBJECT_CLASS_COST[b.objectClass] || number(a.id) - number(b.id),
)

function toSpecies(scp: ScpDefinition): SpeciesData {
  const baseStats =
    'legacy' in scp.stats
      ? scp.stats.legacy
      : templateStats(scp.stats.template, CLASS_STAT_TOTAL[scp.objectClass], scp.stats.tweaks)
  return {
    id: scp.id,
    name: scp.name,
    objectClass: scp.objectClass,
    types: scp.types,
    baseStats,
    moves: scp.moves,
    ability: scp.ability,
  }
}

function buildMoves(): Record<string, MoveData> {
  const moves: Record<string, MoveData> = {}
  const add = (m: MoveData, from: string) => {
    if (moves[m.id]) throw new Error(`move id '${m.id}' (${from}) is already taken`)
    moves[m.id] = m
  }
  for (const m of MOVE_POOL) add(m, 'move pool')
  for (const scp of SCPS) if (scp.signatureMove) add(scp.signatureMove, `${scp.id}'s signature move`)
  return moves
}

export const ROSTER: Dex = {
  moves: buildMoves(),
  species: Object.fromEntries(SCPS.map((scp) => [scp.id, toSpecies(scp)])),
  abilities: ABILITIES,
}

/** Species ids in display order (cheapest object class first, then by number). */
export const ROSTER_ORDER: readonly string[] = SCPS.map((scp) => scp.id)
