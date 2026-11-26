import { ROSTER } from '../data/roster'
import { createCombatant, type Combatant, type SideIndex, type StageName, type StatStages } from '../engine'
import type { Step } from './battleController'
import { STAT_LABEL } from './text'

/**
 * TEMPORARY, so the admin can try the redaction on their own Gift SCPs: while
 * true, a player's own Gift SCPs are redacted too. Set to false once confirmed.
 */
export const REDACT_OWN_GIFTS = true

/** What the details view hides on a Gift SCP; null when nothing is hidden. */
export interface Redaction {
  stats: boolean
  ability: boolean
  /** Per move, in move order: true while it's hidden. */
  moves: readonly boolean[]
}

/**
 * Gift SCPs are partly redacted for anyone viewing them: stats and the
 * ability's description stay hidden, and each move stays hidden until the
 * Gift SCP has used it this battle (its PP went down). The ability is
 * revealed once it visibly triggers.
 */
export function redactionFor(
  speciesId: string,
  opts: { own: boolean; combatant?: Combatant; abilityRevealed?: boolean },
): Redaction | null {
  const sp = ROSTER.species[speciesId]
  if (sp.gift === undefined) return null
  if (opts.own && !REDACT_OWN_GIFTS) return null
  const c = opts.combatant
  const fresh = c ? createCombatant(ROSTER, speciesId, c.equipment).pp : null
  return {
    stats: true,
    ability: !(opts.abilityRevealed || c?.reborn || c?.rewound),
    moves: sp.moves.map((_, i) => !(c && fresh && c.pp[i] < fresh[i])),
  }
}

const key = (side: SideIndex, teamIndex: number) => `${side}:${teamIndex}`

/** Whether the team member at `teamIndex` on `side` has shown its ability (see abilityReveals). */
export function abilityRevealed(shown: ReadonlySet<string>, side: SideIndex, teamIndex: number): boolean {
  return shown.has(key(side, teamIndex))
}

/**
 * Team members whose ability visibly triggered during these steps, as keys
 * for abilityRevealed: an ability event, Rebirth, Rewind, Crescendo stacks,
 * or a critical hit from an SCP whose ability raises its crit chance.
 */
export function abilityReveals(steps: readonly Step[]): string[] {
  const out: string[] = []
  for (const step of steps) {
    for (const e of step.events) {
      if (e.type === 'ability') {
        const active = step.after.sides[e.side].active
        const c = step.after.sides[e.side].team[active]
        if (ROSTER.species[c.speciesId].ability === e.abilityId) out.push(key(e.side, active))
      } else if (e.type === 'revive' || e.type === 'rewind' || (e.type === 'stacks' && e.stacks > 0)) {
        out.push(key(e.side, step.after.sides[e.side].active))
      } else if (e.type === 'damage' && e.crit) {
        const attacker: SideIndex = e.side === 0 ? 1 : 0
        const active = step.before.sides[attacker].active
        const ability = ROSTER.species[step.before.sides[attacker].team[active].speciesId].ability
        if (ability && ROSTER.abilities[ability].rules.some((r) => r.kind === 'critChance'))
          out.push(key(attacker, active))
      }
    }
  }
  return out
}

const STAGE_ORDER: readonly StageName[] = ['atk', 'def', 'spa', 'spd', 'spe', 'acc']

/** Current stat changes, e.g. "Atk +1, Def −1"; empty when there are none. */
export function stageSummary(stages: StatStages): string {
  return STAGE_ORDER.filter((s) => stages[s] !== 0)
    .map((s) => `${STAT_LABEL[s]} ${stages[s] > 0 ? '+' : '−'}${Math.abs(stages[s])}`)
    .join(', ')
}
