import { describe, expect, it } from 'vitest'
import { chooseAction, chooseLead, chooseReplacement, randomTeam } from '../ai'
import {
  activeOf,
  createRng,
  isNeutralized,
  resolveReplacements,
  resolveTurn,
  startBattle,
  teamCost,
  TEAM_BUDGET,
  type BattleState,
  type SideIndex,
} from '../engine'
import { ROSTER, ROSTER_ORDER } from './roster'

/**
 * Balance guard: thousands of AI-vs-AI battles between random legal teams.
 *
 * Per-SCP win rate isn't checked: it mostly measures which teams an SCP tends
 * to end up on. Instead this checks the two things that make the game feel
 * unfair: one SCP sweeping a whole team, and one kind of team (by object
 * class) beating everything.
 */
const BATTLES = 3000
/** No SCP may Neutralize 3+ opponents in more than this share of its battles. */
const MAX_SWEEP_RATE = 0.15
/** No full-budget team makeup (e.g. "EEES") may win more than this share. */
const MAX_MAKEUP_WIN_RATE = 0.7
/** Makeups with fewer battles than this are too noisy to judge. */
const MIN_SAMPLE = 100

interface Tally {
  battles: number
  wins: number
  sweeps: number
}

function simulate() {
  const perScp: Record<string, Tally> = {}
  const perMakeup: Record<string, Tally & { cost: number }> = {}
  for (let seed = 1; seed <= BATTLES; seed++) {
    const rng = createRng(seed)
    const teams = [randomTeam(ROSTER, rng, ROSTER_ORDER), randomTeam(ROSTER, rng, ROSTER_ORDER)]
    const leads: [number, number] = [
      chooseLead(ROSTER, teams[0], teams[1], rng),
      chooseLead(ROSTER, teams[1], teams[0], rng),
    ]
    let s: BattleState = startBattle(ROSTER, [teams[0], teams[1]], leads, seed).state
    const kos = [teams[0].map(() => 0), teams[1].map(() => 0)]

    while (s.phase !== 'ended') {
      if (s.phase === 'replace') {
        const picks = ([0, 1] as const).map((side) =>
          isNeutralized(activeOf(s, side)) && s.sides[side].team.some((c) => !isNeutralized(c))
            ? chooseReplacement(s, ROSTER, side, rng)
            : null,
        ) as [number | null, number | null]
        s = resolveReplacements(s, ROSTER, picks).state
        continue
      }
      const actives = [s.sides[0].active, s.sides[1].active]
      const r = resolveTurn(s, ROSTER, [chooseAction(s, ROSTER, 0, rng), chooseAction(s, ROSTER, 1, rng)])
      // Credit each Neutralization to whoever was active on the other side.
      for (const e of r.events) {
        if (e.type === 'neutralized') {
          const by = (1 - e.side) as SideIndex
          kos[by][actives[by]]++
        }
      }
      s = r.state
    }

    for (const side of [0, 1] as const) {
      const won = s.winner === side ? 1 : 0
      teams[side].forEach((id, i) => {
        const t = (perScp[id] ??= { battles: 0, wins: 0, sweeps: 0 })
        t.battles++
        t.wins += won
        if (kos[side][i] >= 3) t.sweeps++
      })
      const makeup = teams[side].map((id) => ROSTER.species[id].objectClass[0]).sort().join('')
      const m = (perMakeup[makeup] ??= { battles: 0, wins: 0, sweeps: 0, cost: teamCost(ROSTER, teams[side]) })
      m.battles++
      m.wins += won
    }
  }
  return { perScp, perMakeup }
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`

describe('roster balance', () => {
  const { perScp, perMakeup } = simulate()

  it(`no SCP sweeps (3+ Neutralizations) in more than ${pct(MAX_SWEEP_RATE)} of battles`, () => {
    const rates = Object.fromEntries(
      Object.entries(perScp).map(([id, t]) => [id, pct(t.sweeps / t.battles)]),
    )
    const offenders = Object.entries(perScp).filter(([, t]) => t.sweeps / t.battles > MAX_SWEEP_RATE)
    expect(offenders.map(([id]) => id), JSON.stringify(rates)).toEqual([])
  })

  it(`no full-budget team makeup wins more than ${pct(MAX_MAKEUP_WIN_RATE)}`, () => {
    // "Full budget": at most 1 point left over (cost >= budget - 1).
    const full = Object.entries(perMakeup).filter(
      ([, m]) => m.cost >= TEAM_BUDGET - 1 && m.battles >= MIN_SAMPLE,
    )
    expect(full.length).toBeGreaterThan(0)
    const rates = Object.fromEntries(full.map(([k, m]) => [k, pct(m.wins / m.battles)]))
    const offenders = full.filter(([, m]) => m.wins / m.battles > MAX_MAKEUP_WIN_RATE)
    expect(offenders.map(([k]) => k), JSON.stringify(rates)).toEqual([])
  })
})
