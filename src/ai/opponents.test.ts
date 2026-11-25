import { describe, expect, it } from 'vitest'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { WIN_RATES } from '../data/winRates'
import { EQUIPMENT_ORDER } from '../data/equipment'
import {
  bendStats,
  combatantMove,
  counterType,
  createRng,
  legalChoices,
  startBattle,
  validateTeam,
  type BattleEvent,
} from '../engine'
import { padTeam } from '../engine/testing/teams'
import { planText } from '../ui/battleDriver'
import { playerTurn, startSession } from '../ui/battleController'
import { randomTeam } from './index'
import {
  MTF_NAMES,
  OPPONENTS,
  chooseRandomAction,
  makeOpponent,
  strongEquipment,
  strongTeam,
  type OpponentKind,
} from './opponents'

const PLAYER_TEAM = padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131'])
const AI_TEAM = padTeam(ROSTER, ['scp-682', 'scp-999', 'scp-914', 'scp-131'])
const opponent = (kind: OpponentKind, seed = 1) => makeOpponent(kind, createRng(seed))

describe('opponent names', () => {
  it('gives each bot its name; MTFs and O5s vary', () => {
    expect(OPPONENTS.map((o) => o.kind)).toEqual(['scientist', 'trainer', 'mtf', 'o5', 'realityBender'])
    const mtf = opponent('mtf')
    expect(MTF_NAMES.some(([d, n]) => mtf.name === `MTF ${d} '${n}'` && mtf.tag === n)).toBe(true)
    for (let seed = 1; seed <= 50; seed++) expect(opponent('o5', seed).name).toMatch(/^O5-(1[0-3]|[1-9])$/)
    expect(opponent('realityBender').name).toBe('Reality Bender')
  })

  it("names the opponent's SCPs in the battle log", () => {
    const fox = { kind: 'mtf' as const, name: "MTF Epsilon-11 'Nine-Tailed Fox'", tag: 'Nine-Tailed Fox' }
    const { session } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, 1, [[], []], fox)
    expect(session.log[0]).toBe('Nine-Tailed Fox deployed SCP-682.')
    const after = playerTurn(session, { kind: 'move', moveIndex: 0 }).session
    expect(after.log.some((l) => l.startsWith("Nine-Tailed Fox's SCP-682 used "))).toBe(true)
  })
})

describe('Scientist', () => {
  it('only ever picks a legal move, never a voluntary switch', () => {
    const s = startBattle(ROSTER, [PLAYER_TEAM, AI_TEAM], [0, 0], 1).state
    const rng = createRng(3)
    const seen = new Set<number>()
    for (let i = 0; i < 200; i++) {
      const c = chooseRandomAction(s, 1, rng)
      expect(c.kind).toBe('move')
      expect(legalChoices(s, 1)).toContainEqual(c)
      if (c.kind === 'move') seen.add(c.moveIndex)
    }
    expect(seen.size).toBe(4)
  })
})

describe('Trainer', () => {
  it('announces its move before the player picks, then uses exactly that move', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { session } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, seed, [[], []], opponent('trainer', seed))
      expect(session.plan).not.toBeNull()
      const text = planText(session)!
      expect(text).toMatch(/^Trainer will (use|switch to) .+\.$/)
      const plan = session.plan!
      const events: BattleEvent[] = playerTurn(session, { kind: 'move', moveIndex: 0 }).steps[0].events
      if (plan.kind === 'switch') {
        expect(events).toContainEqual(expect.objectContaining({ type: 'switch', side: 1, to: plan.teamIndex }))
      } else {
        const name = text.replace(/^Trainer will use /, '').replace(/\.$/, '')
        const used = events.find((e) => e.type === 'move' && e.side === 1)
        // The AI may be Stunned or Amnesiac before acting; when it does act, it uses the announced move.
        if (used && used.type === 'move' && !events.some((e) => e.type === 'amnesia' && e.side === 1)) {
          const sp = ROSTER.species[session.state.sides[1].team[session.state.sides[1].active].speciesId]
          expect(sp.moves[plan.moveIndex]).toBe(used.moveId)
          expect(name.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('has no plan for any other opponent', () => {
    const { session } = startSession(ROSTER, PLAYER_TEAM, AI_TEAM, 0, 1, [[], []], opponent('mtf'))
    expect(session.plan).toBeNull()
    expect(planText(session)).toBeNull()
  })
})

describe('O5 Council Member', () => {
  it('builds legal teams that score above random ones', () => {
    const score = (t: readonly string[]) => t.reduce((s, id) => s + (WIN_RATES.scp[id] ?? 0.5), 0)
    const rng = createRng(7)
    let strong = 0
    let random = 0
    for (let i = 0; i < 5; i++) {
      const team = strongTeam(ROSTER, rng, ROSTER_ORDER, WIN_RATES)
      expect(validateTeam(ROSTER, team)).toEqual([])
      strong += score(team)
      random += score(randomTeam(ROSTER, rng, ROSTER_ORDER))
    }
    expect(strong).toBeGreaterThan(random)
  })

  it('only carries Equipment that wins more than it loses, and stays legal', () => {
    const rng = createRng(9)
    for (let i = 0; i < 5; i++) {
      const team = strongTeam(ROSTER, rng, ROSTER_ORDER, WIN_RATES)
      const gear = strongEquipment(ROSTER, rng, team, WIN_RATES)
      expect(validateTeam(ROSTER, team, gear)).toEqual([])
      for (const id of gear) if (id !== null) expect(WIN_RATES.equipment[id]).toBeGreaterThan(0.5)
    }
  })

  it('has a win rate for every SCP and Equipment piece (rerun `npm run balance` after adding any)', () => {
    expect(ROSTER_ORDER.filter((id) => WIN_RATES.scp[id] === undefined)).toEqual([])
    expect(EQUIPMENT_ORDER.filter((id) => WIN_RATES.equipment[id] === undefined)).toEqual([])
  })
})

describe('Reality Bender', () => {
  it('moves each type to the one before it on the ring; Mundane stays', () => {
    expect(counterType('Kinetic')).toBe('Temporal')
    expect(counterType('Mechanical')).toBe('Kinetic')
    expect(counterType('Antimemetic')).toBe('Mechanical')
    expect(counterType('Mundane')).toBe('Mundane')
  })

  it('swaps stats by rank: best with worst, 2nd with 5th, 3rd with 4th', () => {
    expect(bendStats({ hp: 60, atk: 150, def: 80, spa: 50, spd: 70, spe: 120 })).toEqual({
      hp: 120,
      atk: 50,
      def: 70,
      spa: 150,
      spd: 80,
      spe: 60,
    })
  })

  it("bends only the Reality Bender's side, at full (swapped) HP", () => {
    const normal = startBattle(ROSTER, [PLAYER_TEAM, AI_TEAM], [0, 0], 1).state
    const bent = startBattle(ROSTER, [PLAYER_TEAM, AI_TEAM], [0, 0], 1, [[], []], { bent: [false, true] }).state
    expect(bent.sides[0].team[0]).toEqual(normal.sides[0].team[0])
    const foe = bent.sides[1].team[0]
    expect(foe.bent).toBe(true)
    expect(foe.stats).toEqual(bendStats(normal.sides[1].team[0].stats))
    expect(foe.hp).toBe(foe.stats.hp)
    const rampage = ROSTER.moves['rampage']
    expect(combatantMove(ROSTER, foe, 'rampage').type).toBe(counterType(rampage.type))
    expect(combatantMove(ROSTER, normal.sides[1].team[0], 'rampage')).toBe(rampage)
  })
})
