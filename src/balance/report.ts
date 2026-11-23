import { OBJECT_CLASS_COST, type Dex, type ObjectClass } from '../engine'
import {
  BATTLES_PER_SCP,
  balanceProblems,
  MAX_SWEEP_RATE,
  MIN_MAKEUP_SAMPLE,
  typeSpread,
  typeSpreadProblems,
  WIN_RATE_BAND,
} from './rules'
import type { BalanceResult } from './simulate'

const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const row = (cells: (string | number)[]) => `| ${cells.join(' | ')} |`

/** The full balance report as Markdown. */
export function balanceReport(dex: Dex, roster: readonly string[], result: BalanceResult): string {
  const problems = [...balanceProblems(result, roster), ...typeSpreadProblems(typeSpread(dex, roster))]
  const lines: string[] = [
    '# Balance report',
    '',
    `${result.battles} AI-vs-AI battles (${BATTLES_PER_SCP} built around each of ${roster.length} SCPs). ` +
      `${result.timeouts} reached the turn limit.`,
    '',
    '## Problems',
    '',
    ...(problems.length > 0 ? problems.map((p) => `- ${p}`) : ['None.']),
  ]

  // Per SCP, best win rate first.
  const scps = roster
    .map((id) => ({ id, t: result.perScp[id] }))
    .sort((a, b) => b.t.wins / b.t.battles - a.t.wins / a.t.battles)
  lines.push('', '## SCPs', '', row(['SCP', 'Class', 'Battles', 'Win', 'Sweep 3+', '']), row(['---', '---', '---:', '---:', '---:', '---']))
  for (const { id, t } of scps) {
    const win = t.wins / t.battles
    const sweep = t.sweeps / t.battles
    const flag = sweep > MAX_SWEEP_RATE || win < WIN_RATE_BAND[0] || win > WIN_RATE_BAND[1] ? '⚠' : ''
    lines.push(row([dex.species[id].name, dex.species[id].objectClass, t.battles, pct(win), pct(sweep), flag]))
  }

  // Per object class (every appearance of an SCP of that class).
  const byClass = new Map<ObjectClass, { battles: number; wins: number }>()
  for (const id of roster) {
    const c = dex.species[id].objectClass
    const agg = byClass.get(c) ?? { battles: 0, wins: 0 }
    agg.battles += result.perScp[id].battles
    agg.wins += result.perScp[id].wins
    byClass.set(c, agg)
  }
  lines.push('', '## Object classes', '', row(['Class', 'Cost', 'Win']), row(['---', '---:', '---:']))
  for (const [c, agg] of [...byClass].sort((a, b) => OBJECT_CLASS_COST[a[0]] - OBJECT_CLASS_COST[b[0]])) {
    lines.push(row([c, OBJECT_CLASS_COST[c], pct(agg.wins / agg.battles)]))
  }

  // Team makeups with enough battles to judge.
  lines.push('', `## Team makeups (${MIN_MAKEUP_SAMPLE}+ battles)`, '', row(['Makeup', 'Cost', 'Battles', 'Win']), row(['---', '---:', '---:', '---:']))
  const makeups = Object.entries(result.perMakeup)
    .filter(([, m]) => m.battles >= MIN_MAKEUP_SAMPLE)
    .sort((a, b) => b[1].wins / b[1].battles - a[1].wins / a[1].battles)
  for (const [k, m] of makeups) lines.push(row([k, m.cost, m.battles, pct(m.wins / m.battles)]))

  // Type spread.
  const spread = typeSpread(dex, roster)
  lines.push(
    '',
    '## Type spread',
    '',
    `Allowed: ${spread.scpRange.join('–')} SCPs and ${spread.moveRange.join('–')} attacking-move slots per type.`,
    '',
    row(['Type', 'SCPs', 'Attacking moves']),
    row(['---', '---:', '---:']),
    ...spread.counts.map((c) => row([c.type, c.scps, c.moves])),
  )

  // Moves.
  const onRoster = [...new Set(roster.flatMap((id) => dex.species[id].moves))]
  const used = onRoster.map((m) => ({ m, n: result.moveUses[m] ?? 0 })).sort((a, b) => b.n - a.n)
  const name = (m: string) => dex.moves[m].name
  lines.push(
    '',
    '## Moves',
    '',
    `Most used: ${used.slice(0, 10).map(({ m, n }) => `${name(m)} (${n})`).join(', ')}.`,
    '',
    `Never used: ${used.filter(({ n }) => n === 0).map(({ m }) => name(m)).join(', ') || 'none'}.`,
    '',
  )
  return lines.join('\n')
}
