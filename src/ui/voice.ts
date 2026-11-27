import type { OpponentKind } from '../ai/opponents'
import { ENGINEER_MOVE_LINES, VOICE_LINES, type VoiceTrigger } from '../ai/voiceLines'
import { combatantMove, isNeutralized, moveName, type BattleState, type Dex } from '../engine'
import type { Step } from './battleController'
import { HOSTILE, PLAYER } from './battleLog'

/** What the opponent says after some steps: who says it and the line. */
export interface VoiceLine {
  trigger: VoiceTrigger | 'move'
  text: string
}

/** Triggers in priority order: at most one line per batch of steps. */
const ORDER: readonly VoiceTrigger[] = ['win', 'lose', 'koFoe', 'lostOne', 'lastLow', 'superEffective']

/** A random line for `trigger` (`pick` returns an index below its argument). */
export function lineFor(kind: OpponentKind, trigger: VoiceTrigger, pick: (n: number) => number): string {
  const lines = VOICE_LINES[kind][trigger]
  return lines[pick(lines.length)]
}

/**
 * The line (if any) the opponent says after `steps`. `lowSaid` is true once
 * it has already remarked on its last SCP being low, which it does once a
 * battle. The Engineer also reacts to your attacks that are super or poorly
 * effective against it, with a line for that very move.
 */
export function voiceAfter(
  kind: OpponentKind,
  dex: Dex,
  steps: readonly Step[],
  lowSaid: boolean,
  pick: (n: number) => number,
): VoiceLine | null {
  const seen = new Set<VoiceTrigger>()
  let moveLine: string | null = null
  for (const step of steps) {
    let playerMove: { speciesId: string; moveId: string } | null = null
    for (const e of step.events) {
      if (e.type === 'end') seen.add(e.winner === HOSTILE ? 'win' : 'lose')
      else if (e.type === 'neutralized') seen.add(e.side === PLAYER ? 'koFoe' : 'lostOne')
      else if (e.type === 'move' && e.side === PLAYER) {
        playerMove = { speciesId: step.before.sides[PLAYER].team[step.before.sides[PLAYER].active].speciesId, moveId: e.moveId }
      } else if (e.type === 'damage' && e.side === PLAYER && e.effectiveness >= 2) seen.add('superEffective')
      else if (e.type === 'damage' && e.side === HOSTILE && playerMove && kind === 'engineer' && !moveLine) {
        const lines = ENGINEER_MOVE_LINES[playerMove.moveId]
        const which = e.effectiveness >= 2 ? 'strong' : e.effectiveness <= 0.5 ? 'weak' : null
        if (lines && which) moveLine = fillMove(lines[which], dex, step.before, playerMove)
      }
    }
    if (!lowSaid && lastIsLow(step.after)) seen.add('lastLow')
  }
  const trigger = ORDER.find((t) => seen.has(t))
  // Endings and knockouts outrank a remark about your move; the rest don't.
  if (moveLine && (!trigger || trigger === 'superEffective' || trigger === 'lastLow')) return { trigger: 'move', text: moveLine }
  return trigger ? { trigger, text: lineFor(kind, trigger, pick) } : null
}

/** True when the opponent is down to its last SCP and that one is at a quarter of its HP or less. */
function lastIsLow(s: BattleState): boolean {
  const alive = s.sides[HOSTILE].team.filter((c) => !isNeutralized(c))
  return alive.length === 1 && alive[0].hp <= alive[0].stats.hp / 4
}

/** Fill `{move}` with the name the player's SCP gives that move. */
function fillMove(text: string, dex: Dex, s: BattleState, used: { speciesId: string; moveId: string }): string {
  if (!text.includes('{move}')) return text
  const c = s.sides[PLAYER].team[s.sides[PLAYER].active]
  return text.split('{move}').join(moveName(dex, used.speciesId, combatantMove(dex, c, used.moveId)))
}
