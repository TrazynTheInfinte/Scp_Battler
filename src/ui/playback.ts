import type { BattleEvent, BattleState, Dex, SideIndex } from '../engine'
import type { Step } from './battleController'
import { formatEvents } from './battleLog'

/** One beat of battle playback: what to show, the log lines it adds, and who (if anyone) got hit. */
export interface Frame {
  view: BattleState
  lines: string[]
  hit: SideIndex | null
}

/**
 * Apply one event's visible effect to a display state (actives, HP, status).
 * Stat stages and other hidden details aren't shown, so they're skipped; every
 * step ends with a frame showing the step's true final state anyway.
 */
export function applyEventToView(view: BattleState, e: BattleEvent): BattleState {
  const next: BattleState = {
    ...view,
    sides: [
      { ...view.sides[0], team: view.sides[0].team.map((c) => ({ ...c })) },
      { ...view.sides[1], team: view.sides[1].team.map((c) => ({ ...c })) },
    ],
  }
  const activeOf = (side: SideIndex) => next.sides[side].team[next.sides[side].active]
  switch (e.type) {
    case 'switch':
    case 'replace':
      next.sides[e.side].active = e.to
      break
    case 'damage':
    case 'residual':
    case 'recoil':
    case 'abilityDamage':
    case 'heal':
    case 'revive':
    case 'rewind':
    case 'trapHurt':
      activeOf(e.side).hp = e.hpAfter
      if (e.type === 'revive') activeOf(e.side).reborn = true
      break
    case 'neutralized':
      next.sides[e.side].team[e.teamIndex].hp = 0
      break
    case 'status':
      activeOf(e.side).status = { name: e.status, turnsLeft: null }
      break
    case 'statusEnded':
      activeOf(e.side).status = null
      break
    case 'stacks':
      activeOf(e.side).volatiles = { ...activeOf(e.side).volatiles, stacks: e.stacks }
      break
    default:
      break
  }
  return next
}

/** Frames for a sequence of steps: one per event, then a snap to each step's real final state. */
export function framesFor(steps: readonly Step[], dex: Dex, hostileTag?: string): Frame[] {
  const frames: Frame[] = []
  for (const step of steps) {
    let view = step.before
    for (const e of step.events) {
      const lines = formatEvents(view, [e], dex, hostileTag)
      view = applyEventToView(view, e)
      frames.push({ view, lines, hit: e.type === 'damage' ? e.side : null })
    }
    frames.push({ view: step.after, lines: [], hit: null })
  }
  return frames
}
