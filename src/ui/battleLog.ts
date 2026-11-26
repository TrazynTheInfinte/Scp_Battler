import { STRUGGLE, moveName, type BattleEvent, type BattleState, type Dex, type SideIndex } from '../engine'
import { STAT_LABEL } from './text'

/** The human player is always side 0; the AI is side 1. */
export const PLAYER: SideIndex = 0
export const HOSTILE: SideIndex = 1

/**
 * Turn engine events into log lines. `before` is the state the events were
 * produced from; active SCPs are tracked through switches so every line
 * names the right SCP. The opponent's HP is reported as a percentage only.
 * `hostileTag` names the opponent ("Nine-Tailed Fox" gives "Nine-Tailed Fox's
 * SCP-682"); without one, its SCPs are "Hostile" and it is "The hostile site".
 */
export function formatEvents(
  before: BattleState,
  events: readonly BattleEvent[],
  dex: Dex,
  hostileTag?: string,
): string[] {
  const active: [number, number] = [before.sides[0].active, before.sides[1].active]
  const site = hostileTag ?? 'The hostile site'
  /** An SCP's plain name, for lines that already say whose it is. */
  const bare = (side: SideIndex, teamIndex: number) => dex.species[before.sides[side].team[teamIndex].speciesId].name
  const nameAt = (side: SideIndex, teamIndex: number) => {
    const name = bare(side, teamIndex)
    if (side !== HOSTILE) return name
    return hostileTag ? `${hostileTag}'s ${name}` : `Hostile ${name}`
  }
  const name = (side: SideIndex) => nameAt(side, active[side])
  const maxHp = (side: SideIndex) => before.sides[side].team[active[side]].stats.hp

  const lines: string[] = []
  for (const e of events) {
    switch (e.type) {
      case 'switch': {
        const from = nameAt(e.side, e.from)
        active[e.side] = e.to
        lines.push(
          e.side === PLAYER
            ? `You withdrew ${from} and deployed ${name(e.side)}.`
            : `${site} withdrew ${bare(e.side, e.from)} and deployed ${bare(e.side, e.to)}.`,
        )
        break
      }
      case 'replace':
        active[e.side] = e.to
        lines.push(
          e.side === PLAYER
            ? `You deployed ${name(e.side)}.`
            : `${site} deployed ${bare(e.side, e.to)}.`,
        )
        break
      case 'stunned':
        lines.push(`${name(e.side)} is STUNNED and can't act!`)
        break
      case 'amnesia':
        lines.push(`${name(e.side)} forgot what it was doing...`)
        break
      case 'move':
        lines.push(
          `${name(e.side)} used ${moveName(dex, before.sides[e.side].team[active[e.side]].speciesId, dex.moves[e.moveId] ?? STRUGGLE)}.`,
        )
        if (e.moveId === STRUGGLE.id) lines.splice(-1, 0, `${name(e.side)} has no PP left!`)
        break
      case 'miss':
        lines.push('It missed.')
        break
      case 'noEffect':
        lines.push('It had no effect.')
        break
      case 'damage': {
        if (e.crit) lines.push('Critical breach!')
        if (e.effectiveness >= 4) lines.push('Catastrophically effective!')
        else if (e.effectiveness >= 2) lines.push('Highly effective.')
        else if (e.effectiveness <= 0.5) lines.push('Poorly effective.')
        lines.push(damageLine(name(e.side), e.side, e.amount, maxHp(e.side)))
        break
      }
      case 'residual':
        lines.push(
          `${name(e.side)} is hurt by ${e.status === 'Bleeding' ? 'BLEEDING' : 'CONTAINMENT'}. ` +
            damageLine('', e.side, e.amount, maxHp(e.side)).trim(),
        )
        break
      case 'abilityDamage':
        lines.push(damageLine(name(e.side), e.side, e.amount, maxHp(e.side)))
        break
      case 'recoil':
        lines.push(`${name(e.side)} is hurt by the strain. ${damageLine('', e.side, e.amount, maxHp(e.side)).trim()}`)
        break
      case 'frozen':
        lines.push(`${name(e.side)} can't move while it's being watched!`)
        break
      case 'heal':
        lines.push(`${name(e.side)} recovered ${amountText(e.side, e.amount, maxHp(e.side))}.`)
        break
      case 'stage': {
        const size = Math.abs(e.delta)
        const verb =
          e.delta > 0
            ? size >= 2 ? 'rose sharply' : 'rose'
            : size >= 2 ? 'fell harshly' : 'fell'
        lines.push(`${name(e.side)}'s ${STAT_LABEL[e.stat]} ${verb}.`)
        break
      }
      case 'status':
        lines.push(`${name(e.side)} is now ${e.status.toUpperCase()}.`)
        break
      case 'statusEnded':
        lines.push(`${name(e.side)} is no longer ${e.status.toUpperCase()}.`)
        break
      case 'ability': {
        const ability = dex.abilities[e.abilityId]
        const label = `${name(e.side)}'s ${ability?.name.toUpperCase() ?? e.abilityId}`
        lines.push(e.typeName ? `${label}: now resistant to ${e.typeName}.` : `${label}!`)
        break
      }
      case 'equipment':
        lines.push(`${name(e.side)}'s ${dex.equipment[e.equipmentId]?.name ?? e.equipmentId}!`)
        break
      case 'neutralized':
        lines.push(`${nameAt(e.side, e.teamIndex)} was neutralized.`)
        break
      case 'forfeit':
        lines.push(e.side === PLAYER ? 'You forfeited.' : `${site} forfeited.`)
        break
      case 'withdraw':
        lines.push(`${name(e.side)} will withdraw at the end of the turn.`)
        break
      case 'revive':
        lines.push(`${name(e.side)} rose from the ashes!`)
        break
      case 'rewind':
        lines.push(`Time ran backwards for ${name(e.side)}.`)
        break
      case 'foretold':
        lines.push(
          e.phase === 'set'
            ? `${name(e.side)} foretold a strike.`
            : e.phase === 'lands'
              ? 'The foretold strike lands!'
              : 'The foretold strike found no one.',
        )
        break
      case 'stacks':
        lines.push(
          e.stacks > 0
            ? `${name(e.side)}'s music swells (${'♪'.repeat(e.stacks)}).`
            : `${name(e.side)}'s music falls silent.`,
        )
        break
      case 'timeout':
        lines.push('CONTAINMENT TIMEOUT — decided by remaining HP.')
        break
      case 'end':
        lines.push(
          e.winner === 'draw'
            ? 'DRAW — both sites lost containment.'
            : e.winner === PLAYER
              ? 'VICTORY — hostile anomalies neutralized.'
              : 'DEFEAT — your containment team was lost.',
        )
        break
    }
  }
  return lines
}

function amountText(side: SideIndex, amount: number, max: number): string {
  return side === HOSTILE ? `${Math.max(1, Math.round((amount / max) * 100))}% HP` : `${amount} HP`
}

function damageLine(who: string, side: SideIndex, amount: number, max: number): string {
  return `${who} lost ${amountText(side, amount, max)}.`.trim()
}
