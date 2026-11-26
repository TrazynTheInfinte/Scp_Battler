import { OBJECT_CLASS_COST, type Dex, type MoveData, type SpeciesData } from '../engine'
import { ABILITIES } from './abilities'
import { EQUIPMENT } from './equipment'
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

/**
 * Operatives (see GLOSSARY.md) have ids starting `op-`; Gift SCPs `gift-`;
 * SCP-EX entries end `-ex` (`scp-<number>-ex`); every other id is `scp-<number>`.
 */
export const isOperative = (id: string) => id.startsWith('op-')
export const isGift = (id: string) => id.startsWith('gift-')
export const isExplained = (id: string) => id.endsWith('-ex')
const number = (id: string) => parseInt(id.replace(/^scp-/, ''), 10)
/** Named (not numbered) entries sort by name after the numbered ones. */
const isNamed = (id: string) => isOperative(id) || isGift(id)

/**
 * Every SCP definition, in display order: cheapest object class first; within
 * a class, numbered SCPs by number, then Operatives and Gift SCPs by name.
 */
export const SCPS: readonly ScpDefinition[] = Object.values(SCP_FILES).sort(
  (a, b) =>
    OBJECT_CLASS_COST[a.objectClass] - OBJECT_CLASS_COST[b.objectClass] ||
    Number(isNamed(a.id)) - Number(isNamed(b.id)) ||
    (isNamed(a.id)
      ? a.name.localeCompare(b.name)
      : number(a.id) - number(b.id) || Number(isExplained(a.id)) - Number(isExplained(b.id))),
)

function toSpecies(scp: ScpDefinition): SpeciesData {
  const baseStats = templateStats(scp.stats.template, CLASS_STAT_TOTAL[scp.objectClass], scp.stats.tweaks)
  return {
    id: scp.id,
    name: scp.name,
    objectClass: scp.objectClass,
    types: scp.types,
    baseStats,
    moves: scp.moves,
    ability: scp.ability,
    ...(scp.moveNames ? { moveNames: scp.moveNames } : {}),
    ...(scp.gift ? { gift: scp.gift } : {}),
  }
}

function buildMoves(): Record<string, MoveData> {
  const moves: Record<string, MoveData> = {}
  const add = (m: MoveData, from: string) => {
    if (moves[m.id]) throw new Error(`move id '${m.id}' (${from}) is already taken`)
    moves[m.id] = m
  }
  for (const m of MOVE_POOL) add(m, 'move pool')
  for (const scp of SCPS) {
    if (scp.signatureMove) add(scp.signatureMove, `${scp.id}'s signature move`)
    for (const m of scp.ownMoves ?? []) add(m, `${scp.id}'s own move`)
  }
  return moves
}

/** Every SCP the engine knows, Gift SCPs included (an online opponent may field one). */
export const ROSTER: Dex = {
  moves: buildMoves(),
  species: Object.fromEntries(SCPS.map((scp) => [scp.id, toSpecies(scp)])),
  abilities: ABILITIES,
  equipment: EQUIPMENT,
}

/**
 * The SCPs every player has, in display order (cheapest object class first,
 * then by number, then Operatives). Gift SCPs are left out: they're only for
 * Accounts holding a Grant, and the AI never fields them.
 */
export const ROSTER_ORDER: readonly string[] = SCPS.filter((scp) => !isGift(scp.id)).map((scp) => scp.id)

/** Gift SCPs, in display order. */
export const GIFT_ORDER: readonly string[] = SCPS.filter((scp) => isGift(scp.id)).map((scp) => scp.id)

/** Everything, for balance runs: Gift SCPs are balanced like every other SCP. */
export const BALANCE_ORDER: readonly string[] = SCPS.map((scp) => scp.id)
