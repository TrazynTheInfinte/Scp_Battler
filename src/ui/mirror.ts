import type { BattleEvent, BattleState, SideIndex } from '../engine'

/**
 * The UI always shows the viewer as side 0 (see battleLog's PLAYER). Online,
 * the player who joined a Room is engine side 1, so their browser runs the
 * real battle and mirrors what it shows. Mirroring twice is the identity.
 */
const flip = (side: SideIndex): SideIndex => (side === 0 ? 1 : 0)

export function mirrorState(s: BattleState): BattleState {
  return {
    ...s,
    sides: [s.sides[1], s.sides[0]],
    needsReplacement: [s.needsReplacement[1], s.needsReplacement[0]],
    winner: s.winner === null || s.winner === 'draw' ? s.winner : flip(s.winner),
  }
}

export function mirrorEvent(e: BattleEvent): BattleEvent {
  if ('side' in e) return { ...e, side: flip(e.side) }
  if (e.type === 'end' && e.winner !== 'draw') return { ...e, winner: flip(e.winner) }
  return e
}
