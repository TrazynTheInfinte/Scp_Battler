import type { MoveData, MoveEffect, StageableStat, TypeName } from '../engine'

export const STAT_LABEL: Readonly<Record<StageableStat | 'hp', string>> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'Sp.Atk',
  spd: 'Sp.Def',
  spe: 'Speed',
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
  const parts = (Object.entries(changes.changes) as [StageableStat, number][])
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
  }
}

/** One-line stats summary, e.g. "Physical · 100 power · 85% accuracy". */
export function moveSummary(m: MoveData): string {
  const acc = m.accuracy === null ? 'never misses' : `${m.accuracy}% accuracy`
  return m.category === 'Status' ? `Status · ${acc}` : `${m.category} · ${m.power} power · ${acc}`
}

/** Full move description: summary plus every effect. */
export function describeMove(m: MoveData): string {
  return [moveSummary(m), ...(m.effects ?? []).map(describeEffect)].join('. ').replace(/\.\./g, '.')
}
