import { describe, expect, it } from 'vitest'
import {
  ABILITIES,
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
import { DOSSIERS } from './dossiers'
import { ROSTER, ROSTER_ORDER } from './roster'

const species = Object.values(ROSTER.species)
const moves = Object.values(ROSTER.moves)

describe('roster integrity', () => {
  it('has 12 SCPs: 4 Safe, 5 Euclid, 3 Keter', () => {
    expect(species).toHaveLength(12)
    const count = (c: string) => species.filter((sp) => sp.objectClass === c).length
    expect([count('Safe'), count('Euclid'), count('Keter')]).toEqual([4, 5, 3])
    expect(ROSTER_ORDER).toHaveLength(12)
  })

  it('scales base stat totals with object class', () => {
    const expected = { Safe: 450, Euclid: 475, Keter: 600 }
    for (const sp of species) {
      const total = Object.values(sp.baseStats).reduce((a, b) => a + b, 0)
      expect(total, sp.id).toBe(expected[sp.objectClass])
    }
  })

  it('every SCP has 4 distinct existing moves, a real ability, and a same-type attack', () => {
    for (const sp of species) {
      expect(new Set(sp.moves).size, sp.id).toBe(4)
      for (const id of sp.moves) expect(ROSTER.moves[id], `${sp.id}: ${id}`).toBeDefined()
      expect(sp.ability && ABILITIES[sp.ability], sp.id).toBeTruthy()
      const sameType = sp.moves.some((id) => {
        const m = ROSTER.moves[id]
        return m.category !== 'Status' && (sp.types as readonly string[]).includes(m.type)
      })
      expect(sameType, sp.id).toBe(true)
    }
  })

  it('every move is used and well-formed', () => {
    const used = new Set(species.flatMap((sp) => sp.moves))
    for (const m of moves) {
      expect(used.has(m.id), m.id).toBe(true)
      if (m.category === 'Status') expect(m.power, m.id).toBe(0)
      else expect(m.power, m.id).toBeGreaterThan(0)
      if (m.accuracy !== null) expect(m.accuracy, m.id).toBeGreaterThan(0)
      for (const e of m.effects ?? []) {
        if ('chance' in e) expect(e.chance, m.id).toBeGreaterThan(0)
      }
    }
  })

  it('every SCP has a dossier with credits', () => {
    for (const sp of species) {
      const d = DOSSIERS[sp.id]
      expect(d, sp.id).toBeDefined()
      expect(d.authors.length, sp.id).toBeGreaterThan(0)
      expect(d.wikiUrl).toBe(`https://scp-wiki.wikidot.com/${sp.id}`)
      expect(sp.name).toBe(sp.id.toUpperCase())
    }
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
