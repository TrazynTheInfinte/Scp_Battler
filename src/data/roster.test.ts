import { describe, expect, it } from 'vitest'
import {
  OBJECT_CLASS_COST,
  TURN_LIMIT,
  TEAM_BUDGET,
  createRng,
  legalChoices,
  resolveReplacements,
  resolveTurn,
  startBattle,
  switchTargets,
  validateTeam,
  type BattleState,
  type Rng,
  type SideIndex,
} from '../engine'
import { ROSTER, ROSTER_ORDER } from './roster'

// Per-SCP rules live in scps.test.ts.
describe('roster integrity', () => {
  it('lists every SCP once, cheapest object class first', () => {
    expect([...ROSTER_ORDER].sort()).toEqual(Object.keys(ROSTER.species).sort())
    const costs = ROSTER_ORDER.map((id) => OBJECT_CLASS_COST[ROSTER.species[id].objectClass])
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
  })
})

/** A random legal team: 4 distinct SCPs within budget. */
function randomTeam(rng: Rng): string[] {
  for (;;) {
    const pool = [...ROSTER_ORDER]
    const team: string[] = []
    while (team.length < 4) team.push(pool.splice(rng.int(0, pool.length - 1), 1)[0])
    if (validateTeam(ROSTER, team).length === 0) return team
  }
}

/** Play a whole battle with random legal choices. */
function playRandomBattle(seed: number): BattleState {
  const rng = createRng(seed ^ 0x5eed)
  const teams: [string[], string[]] = [randomTeam(rng), randomTeam(rng)]
  let s = startBattle(ROSTER, teams, [rng.int(0, 3), rng.int(0, 3)], seed).state
  for (let step = 0; step < 1000 && s.phase !== 'ended'; step++) {
    if (s.phase === 'choose') {
      const pick = (side: SideIndex) => {
        const options = legalChoices(s, side)
        return options[rng.int(0, options.length - 1)]
      }
      s = resolveTurn(s, ROSTER, [pick(0), pick(1)]).state
    } else {
      const pick = (side: SideIndex) => {
        if (!s.needsReplacement[side]) return null
        const options = switchTargets(s, side)
        return options[rng.int(0, options.length - 1)]
      }
      s = resolveReplacements(s, ROSTER, [pick(0), pick(1)]).state
    }
  }
  return s
}

describe('roster battles (fuzz)', () => {
  it('random teams fit the budget', () => {
    const rng = createRng(1)
    for (let i = 0; i < 200; i++) {
      const cost = randomTeam(rng).reduce(
        (sum, id) => sum + OBJECT_CLASS_COST[ROSTER.species[id].objectClass],
        0,
      )
      expect(cost).toBeLessThanOrEqual(TEAM_BUDGET)
    }
  })

  it('300 random battles all finish without errors, and replay identically', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const end = playRandomBattle(seed)
      expect(end.phase, `seed ${seed}`).toBe('ended')
      expect(end.winner, `seed ${seed}`).not.toBeNull()
      expect(end.turn, `seed ${seed}`).toBeLessThanOrEqual(TURN_LIMIT)
    }
    expect(playRandomBattle(42)).toEqual(playRandomBattle(42))
  })
})
