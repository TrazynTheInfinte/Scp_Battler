import { describe, expect, it } from 'vitest'
import {
  OBJECT_CLASS_COST,
  TURN_LIMIT,
  TEAM_BUDGET,
  TEAM_SIZE,
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
import { BALANCE_ORDER, GIFT_ORDER, ROSTER, ROSTER_ORDER, isGift, isOperative } from './roster'

// Per-SCP rules live in scps.test.ts.
describe('roster integrity', () => {
  it('lists every SCP once, cheapest object class first, Operatives after numbered SCPs', () => {
    expect([...BALANCE_ORDER].sort()).toEqual(Object.keys(ROSTER.species).sort())
    expect([...ROSTER_ORDER, ...GIFT_ORDER].sort()).toEqual([...BALANCE_ORDER].sort())
    expect(ROSTER_ORDER.filter(isGift), 'Gift SCPs are not on the everyone roster').toEqual([])
    expect(GIFT_ORDER.length).toBeGreaterThan(0)
    const costs = ROSTER_ORDER.map((id) => OBJECT_CLASS_COST[ROSTER.species[id].objectClass])
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
    for (let i = 1; i < ROSTER_ORDER.length; i++) {
      const [prev, next] = [ROSTER_ORDER[i - 1], ROSTER_ORDER[i]]
      if (costs[i - 1] === costs[i] && isOperative(prev)) expect(isOperative(next), `${prev} before ${next}`).toBe(true)
    }
  })
})

/** A random legal team: TEAM_SIZE distinct SCPs within budget and class limits. */
function randomTeam(rng: Rng): string[] {
  for (let attempt = 0; attempt < 10_000; attempt++) {
    // Gift SCPs too, so their new mechanics get fuzzed.
    const pool = [...BALANCE_ORDER]
    const team: string[] = []
    while (team.length < TEAM_SIZE) team.push(pool.splice(rng.int(0, pool.length - 1), 1)[0])
    if (validateTeam(ROSTER, team).length === 0) return team
  }
  throw new Error('no legal random team found')
}

/** Play a whole battle with random legal choices. */
function playRandomBattle(seed: number): BattleState {
  const rng = createRng(seed ^ 0x5eed)
  const teams: [string[], string[]] = [randomTeam(rng), randomTeam(rng)]
  let s = startBattle(ROSTER, teams, [rng.int(0, TEAM_SIZE - 1), rng.int(0, TEAM_SIZE - 1)], seed).state
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
