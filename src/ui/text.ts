import type { MoveData, MoveEffect, StageName, TypeName } from '../engine'

export const STAT_LABEL: Readonly<Record<StageName | 'hp', string>> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'Sp.Atk',
  spd: 'Sp.Def',
  spe: 'Speed',
  acc: 'Accuracy',
}

export const TYPE_ABBR: Readonly<Record<TypeName, string>> = {
  Kinetic: 'KIN',
  Biological: 'BIO',
  Mechanical: 'MEC',
  Memetic: 'MEM',
  Antimemetic: 'ANT',
  Reality: 'REA',
  Temporal: 'TMP',
  Thaumic: 'THA',
  Mundane: 'MUN',
}

/** Effectiveness tag for move buttons; empty for neutral. */
export function effectivenessTag(mult: number): string {
  if (mult >= 4) return '▲▲ ×4'
  if (mult >= 2) return '▲ ×2'
  if (mult <= 0.25) return '▼▼ ×0.25'
  if (mult <= 0.5) return '▼ ×0.5'
  return ''
}

const STATUS_VERB: Readonly<Record<string, string>> = {
  Bleeding: 'make the target Bleed',
  Stunned: 'Stun the target',
  Amnesiac: 'make the target Amnesiac',
  Contained: 'Contain the target',
}

function stageText(changes: MoveEffect & { kind: 'stages' }): string {
  const parts = (Object.entries(changes.changes) as [StageName, number][])
    .filter(([, n]) => n)
    .map(([stat, n]) => `${STAT_LABEL[stat]} ${n > 0 ? '+' : '−'}${Math.abs(n)}`)
  const who = changes.who === 'user' ? 'User' : 'Target'
  const chance = changes.chance < 100 ? ` (${changes.chance}% chance)` : ''
  return `${who}: ${parts.join(', ')}${chance}.`
}

export function describeEffect(e: MoveEffect): string {
  switch (e.kind) {
    case 'status': {
      const verb = STATUS_VERB[e.status]
      return e.chance >= 100
        ? `${verb[0].toUpperCase()}${verb.slice(1)}.`
        : `${e.chance}% chance to ${verb}.`
    }
    case 'stages':
      return stageText(e)
    case 'heal':
      return `Heals ${e.percent}% of max HP.`
    case 'cure':
      return 'Cures its own status condition.'
    case 'resetSelf':
      return 'Clears its own status condition and stat changes.'
    case 'withdraw':
      return 'Then withdraws at the end of the turn, and you choose who comes in.'
  }
}

/** A move's power as shown: "20–160" for rolled power, "40+" when it grows with Crescendo stacks. */
export function powerLabel(m: MoveData): string {
  if (m.powerRange) return `${m.powerRange[0]}–${m.powerRange[1]}`
  if (m.powerPerStack) return `${m.power}+`
  return `${m.power}`
}

/** One-line stats summary, e.g. "Physical · 100 power · 85% accuracy · 8 PP". */
export function moveSummary(m: MoveData): string {
  const acc = m.accuracy === null ? 'never misses' : `${m.accuracy}% accuracy`
  const base = m.category === 'Status' ? `Status · ${acc}` : `${m.category} · ${powerLabel(m)} power · ${acc}`
  return `${base} · ${m.pp} PP`
}

/** What a move's special mechanics do, if it has any. */
function mechanicsText(m: MoveData): string[] {
  const out: string[] = []
  if (m.powerRange) out.push(`Power is rolled each use, from ${m.powerRange[0]} to ${m.powerRange[1]}.`)
  if (m.powerPerStack) out.push(`+${m.powerPerStack} power per Crescendo stack, then the stacks reset.`)
  if (m.delay) out.push(`Lands ${m.delay} turns later, on whoever is in then.`)
  if (m.missRecoil) out.push(`If it misses, the user loses ${Math.round(m.missRecoil * 100)}% of its max HP.`)
  return out
}

/** Full move description: summary plus every effect. */
export function describeMove(m: MoveData): string {
  return [moveSummary(m), ...mechanicsText(m), ...(m.effects ?? []).map(describeEffect)]
    .join('. ')
    .replace(/\.\./g, '.')
}
