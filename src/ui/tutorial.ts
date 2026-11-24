import { chooseAction, chooseReplacement } from '../ai'
import { ROSTER } from '../data/roster'
import {
  activeOf,
  createRng,
  forfeit,
  resolveReplacements,
  resolveTurn,
  startBattle,
  type BattleState,
  type Choice,
  type Rng,
} from '../engine'
import { toStep, type Step } from './battleController'
import type { BattleDriver, BattleView, DriverListener, Guide } from './battleDriver'
import { HOSTILE, PLAYER } from './battleLog'

/**
 * The Tutorial Battle: a real battle between two fixed, legal teams, where
 * the first few turns are guided. Each lesson is chosen from what's on the
 * field (not the turn number), so a miss just repeats a step:
 *
 *   1. 173 vs 068: use Neck Snap, super effective on a Mechanical SCP.
 *   2. 068 falls; the opponent sends in 049, whose Thaumic moves beat 173: switch to 999, which resists them.
 *   3. 049 makes 999 Bleed: use Embrace, which heals and cures it.
 *   4. Hand-over: the normal AI takes the opposing side from here.
 *
 * Replacing a Neutralized SCP gets a hint whenever it first comes up.
 * src/ui/tutorial.test.ts plays the script to check every lesson happens.
 */

export const TUTORIAL_SEED = 7
export const TUTORIAL_PLAYER_TEAM = ['scp-173', 'scp-999', 'scp-044', 'scp-053', 'scp-105', 'scp-131'] as const
export const TUTORIAL_OPPONENT_TEAM = ['scp-068', 'scp-049', 'scp-042', 'scp-054', 'scp-012', 'scp-018'] as const
/** The lead the player is guided to pick in Team Preview. */
export const TUTORIAL_LEAD = 0

export const TUTORIAL_LEAD_HINT = 'Choose who deploys first. Start with SCP-173: its attacks are strong against the opposing lead.'

const playerAt = (id: string) => TUTORIAL_PLAYER_TEAM.indexOf(id as never)
const opponentAt = (id: string) => TUTORIAL_OPPONENT_TEAM.indexOf(id as never)
const moveOf = (speciesId: string, moveId: string) => ROSTER.species[speciesId].moves.indexOf(moveId)

type Stage = 'hit' | 'switch' | 'status' | 'free'

/** Which lesson the battle is on, from what's on the field. */
function stageOf(s: BattleState, handedOver: boolean): Stage {
  if (handedOver || s.phase !== 'choose') return 'free'
  const me = activeOf(s, PLAYER).speciesId
  const foe = activeOf(s, HOSTILE).speciesId
  if (me === 'scp-173' && foe === 'scp-068') return 'hit'
  if (me === 'scp-173' && foe === 'scp-049') return 'switch'
  if (me === 'scp-999' && foe === 'scp-049' && activeOf(s, PLAYER).status?.name === 'Bleeding') return 'status'
  return 'free'
}

/** The opposing side's scripted choice for a lesson (null: the normal AI decides). */
function scriptedChoice(stage: Stage): Choice | null {
  switch (stage) {
    // 068 braces instead of attacking, so the lesson is only about the super-effective hit.
    case 'hit':
      return { kind: 'move', moveIndex: moveOf('scp-068', 'coarse') }
    // 049 makes whatever is in front of it Bleed: the switched-in 999.
    case 'switch':
      return { kind: 'move', moveIndex: moveOf('scp-049', 'diagnose-pestilence') }
    default:
      return null
  }
}

function guideFor(s: BattleState, stage: Stage, handOverShown: boolean, replaceShown: boolean): Guide | null {
  if (s.phase === 'replace' && s.needsReplacement[PLAYER]) {
    return replaceShown
      ? null
      : {
          text: 'Your SCP was Neutralized. Pick a replacement from your bench: its type badges help you choose a good matchup.',
          allow: { kind: 'any' },
        }
  }
  switch (stage) {
    case 'hit':
      return {
        text: 'Hold a move to see what it does. Neck Snap is Kinetic, which is super effective (▲) against the Mechanical SCP-068. Use it.',
        allow: { kind: 'move', moveIndex: moveOf('scp-173', 'neck-snap') },
      }
    case 'switch':
      return {
        text: "SCP-049's Thaumic moves are super effective against SCP-173. Rather than trade hits, tap Switch and send in SCP-999: Biological resists Thaumic, so 049's attacks will barely hurt it.",
        allow: { kind: 'switch', teamIndex: playerAt('scp-999') },
      }
    case 'status':
      return {
        text: 'SCP-999 is Bleeding: it loses 1/8 of its max HP at the end of every turn. Use Embrace to heal and cure it.',
        allow: { kind: 'move', moveIndex: moveOf('scp-999', 'embrace') },
      }
    case 'free':
      return handOverShown
        ? null
        : { text: 'You know the basics. The opponent plays for real from here: finish the battle!', allow: { kind: 'any' } }
  }
}

/** Starts the Tutorial Battle with the player's chosen lead (they're guided to TUTORIAL_LEAD). */
export function tutorialDriver(playerLead: number): BattleDriver {
  const dex = ROSTER
  const aiRng: Rng = createRng(TUTORIAL_SEED ^ 0x5eed)
  const started = startBattle(dex, [TUTORIAL_PLAYER_TEAM, TUTORIAL_OPPONENT_TEAM], [playerLead, opponentAt('scp-068')], TUTORIAL_SEED)
  const first = toStep(dex, started.state, started)
  let state = started.state
  let log = [
    `The hostile site deployed ${dex.species[activeOf(state, HOSTILE).speciesId].name}.`,
    `You deployed ${dex.species[activeOf(state, PLAYER).speciesId].name}.`,
    ...first.lines,
  ]
  let listener: DriverListener | null = null
  // The AI takes over once the player has acted on the last lesson; the
  // "you know the basics" note and the replacement hint each show once.
  let handedOver = false
  let handOverShown = false
  let replaceShown = false

  const stage = () => stageOf(state, handedOver)
  const push = (steps: Step[]) => {
    for (const st of steps) log = [...log, ...st.lines]
    listener?.advance(steps, { state, log })
  }
  const apply = (step: Step) => {
    state = step.after
    return step
  }
  /** The opposing side needs a replacement on its own: 049 first (lesson 2), then the AI's pick. */
  const opponentReplacement = (s: BattleState) =>
    s.sides[HOSTILE].team[opponentAt('scp-049')].hp > 0 && !handedOver
      ? opponentAt('scp-049')
      : chooseReplacement(s, dex, HOSTILE, aiRng)
  const settle = (steps: Step[]) => {
    if (state.phase === 'replace' && !state.needsReplacement[PLAYER]) {
      steps.push(apply(toStep(dex, state, resolveReplacements(state, dex, [null, opponentReplacement(state)]))))
    }
    return steps
  }

  return {
    initial: { state, log } satisfies BattleView,
    opponent: 'The hostile site',
    listen(l) {
      listener = l
      l.status({ kind: 'ready' })
      return () => {
        listener = null
      }
    },
    guide() {
      return guideFor(state, stage(), handOverShown, replaceShown)
    },
    choose(choice) {
      const current = stage()
      if (current === 'free') handOverShown = true
      if (current === 'status') handedOver = true
      const theirs = scriptedChoice(current) ?? chooseAction(state, dex, HOSTILE, aiRng)
      push(settle([apply(toStep(dex, state, resolveTurn(state, dex, [choice, theirs])))]))
    },
    replace(teamIndex) {
      replaceShown = true
      const theirs = state.needsReplacement[HOSTILE] ? opponentReplacement(state) : null
      push(settle([apply(toStep(dex, state, resolveReplacements(state, dex, [teamIndex, theirs])))]))
    },
    forfeit() {
      push([apply(toStep(dex, state, forfeit(state, PLAYER)))])
    },
  }
}

