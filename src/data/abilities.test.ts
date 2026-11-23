import { describe, expect, it } from 'vitest'
import {
  activeOf,
  ENRAGED_MAX_BOOSTS,
  createBattle,
  resolveReplacements,
  resolveTurn,
  startBattle,
  type BattleEvent,
  type BattleState,
  type Choice,
  type Dex,
} from '../engine'
import { ROSTER } from './roster'

const move = (moveIndex: number): Choice => ({ kind: 'move', moveIndex })
const sw = (teamIndex: number): Choice => ({ kind: 'switch', teamIndex })
const ofType = <T extends BattleEvent['type']>(events: BattleEvent[], type: T) =>
  events.filter((e): e is Extract<BattleEvent, { type: T }> => e.type === type)
const seeds = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

// Fillers: cheap Safe SCPs to complete legal teams.
const team = (lead: string, ...rest: string[]) => {
  const fillers = ['scp-999', 'scp-914', 'scp-343', 'scp-131'].filter(
    (id) => id !== lead && !rest.includes(id),
  )
  return [lead, ...rest, ...fillers].slice(0, 4)
}
const battle = (a: string[], b: string[], seed = 1, dex: Dex = ROSTER): BattleState =>
  createBattle(dex, [a, b], [0, 0], seed)

/** Same roster, with one SCP's ability removed (for with/without comparisons). */
const withoutAbility = (id: string): Dex => ({
  ...ROSTER,
  species: { ...ROSTER.species, [id]: { ...ROSTER.species[id], ability: undefined } },
})

describe('Jovial (999)', () => {
  it('heals 1/16 max HP at end of turn when hurt', () => {
    const s = battle(team('scp-999'), team('scp-914'))
    activeOf(s, 0).hp = 100 // max 255
    // 999 uses Calming Ooze, 914 uses Coarse: no damage either way.
    const { events } = resolveTurn(s, ROSTER, [move(3), move(2)])
    expect(events).toContainEqual({ type: 'ability', side: 0, abilityId: 'jovial' })
    expect(events).toContainEqual({ type: 'heal', side: 0, amount: 15, hpAfter: 115 })
  })

  it('does nothing at full HP', () => {
    const { events } = resolveTurn(battle(team('scp-999'), team('scp-914')), ROSTER, [move(3), move(2)])
    expect(events.some((e) => e.type === 'ability' && e.abilityId === 'jovial')).toBe(false)
  })
})

describe('Precision Engineering (914)', () => {
  it("blocks the opponent's stat drops", () => {
    // 999 Calming Ooze (Atk -1, SpA -1) into 914.
    const { state, events } = resolveTurn(battle(team('scp-999'), team('scp-914')), ROSTER, [
      move(3),
      move(2),
    ])
    expect(events).toContainEqual({ type: 'ability', side: 1, abilityId: 'precisionEngineering' })
    expect(activeOf(state, 1).stages.atk).toBe(0)
    expect(activeOf(state, 1).stages.spa).toBe(0)
    expect(events).toContainEqual({ type: 'noEffect', side: 0 })
  })

  it('still allows its own boosts', () => {
    const { state } = resolveTurn(battle(team('scp-999'), team('scp-914')), ROSTER, [move(3), move(2)])
    expect(activeOf(state, 1).stages.def).toBe(1) // Coarse
  })
})

describe('Willing Detainee (343)', () => {
  it("can't be Contained", () => {
    for (const seed of seeds(20)) {
      // 079 Lockdown into 343.
      const { state } = resolveTurn(battle(team('scp-079'), team('scp-343'), seed), ROSTER, [
        move(2),
        move(3),
      ])
      expect(activeOf(state, 1).status).toBeNull()
    }
  })
})

describe('Ever Watchful (131)', () => {
  it("cancels the opponent's Unobserved", () => {
    // 173 (Spe 105) vs 131 (Spe 140): normally 173 would go first.
    const { events } = resolveTurn(battle(team('scp-173'), team('scp-131')), ROSTER, [
      move(1),
      move(0),
    ])
    expect(events).toContainEqual({ type: 'ability', side: 1, abilityId: 'everWatchful' })
    expect(ofType(events, 'move')[0].side).toBe(1)
  })
})

describe('Ever Watchful (131) vs Unobserved (173)', () => {
  it("173's attacks fail against 131, but its Status moves still work", () => {
    const s = battle(team('scp-173'), team('scp-131'))
    const attack = resolveTurn(s, ROSTER, [move(0), move(3)]) // Neck Snap; 131 Keep Watch
    expect(attack.events).toContainEqual({ type: 'frozen', side: 0 })
    expect(ofType(attack.events, 'damage').filter((e) => e.side === 1)).toEqual([])
    expect(activeOf(attack.state, 0).pp[0]).toBe(activeOf(s, 0).pp[0]) // no PP spent

    const stalk = resolveTurn(s, ROSTER, [move(3), move(3)])
    expect(stalk.events).not.toContainEqual({ type: 'frozen', side: 0 })
    expect(activeOf(stalk.state, 0).stages.atk).toBe(1)
  })

  it('131 now beats 173 one-on-one', () => {
    let wins = 0
    for (const seed of seeds(20)) {
      let s = battle(team('scp-131'), team('scp-173'), seed)
      for (let t = 0; t < 40 && s.phase === 'choose'; t++) {
        s = resolveTurn(s, ROSTER, [move(1), move(0)]).state // Ram vs Neck Snap
      }
      if (s.sides[1].team[0].hp === 0) wins++
    }
    expect(wins).toBe(20)
  })
})

describe('Enraged (096)', () => {
  it('raises Attack by 1 when hit and surviving', () => {
    // 914 Gear Grind into 096.
    const { state, events } = resolveTurn(battle(team('scp-914'), team('scp-096')), ROSTER, [
      move(0),
      move(3),
    ])
    expect(events).toContainEqual({ type: 'ability', side: 1, abilityId: 'enraged' })
    // +1 from Enraged, +1 from Weep.
    expect(activeOf(state, 1).stages.atk).toBe(2)
  })

  it('stops after two raises, and the count resets when it re-enters', () => {
    // 131 Roll Out into 096 four times, 096 hitting back; every SCP is made too bulky to fall.
    let s = battle(team('scp-131'), team('scp-096'))
    for (const c of [...s.sides[0].team, ...s.sides[1].team]) {
      c.stats = { ...c.stats, hp: 9999 }
      c.hp = 9999
    }
    let raises = 0
    for (let i = 0; i < 4; i++) {
      const r = resolveTurn(s, ROSTER, [move(0), move(1)])
      raises += r.events.filter((e) => e.type === 'ability' && e.abilityId === 'enraged').length
      s = r.state
    }
    expect(raises).toBe(ENRAGED_MAX_BOOSTS)
    expect(activeOf(s, 1).stages.atk).toBe(ENRAGED_MAX_BOOSTS)

    // Out and back in: boosts and the count are cleared, so it can rise again.
    // (Roll Out hits 096 as it switches back in: that's its first new raise.)
    s = resolveTurn(s, ROSTER, [move(0), sw(1)]).state
    s = resolveTurn(s, ROSTER, [move(0), sw(0)]).state
    expect(activeOf(s, 1).stages.atk).toBe(1)
    const r = resolveTurn(s, ROSTER, [move(0), move(1)])
    expect(activeOf(r.state, 1).stages.atk).toBe(2)
  })
})

describe('The Cure (049)', () => {
  it('deals 1.5x damage to a target with a status', () => {
    const hit = (statused: boolean) => {
      const s = battle(team('scp-049'), team('scp-914'), 7)
      if (statused) activeOf(s, 1).status = { name: 'Stunned', turnsLeft: null }
      // 049 (faster) uses The Cure on 914 (neutral matchup, survives either hit).
      const r = resolveTurn(s, ROSTER, [move(1), move(2)])
      return ofType(r.events, 'damage').find((e) => e.side === 1)!.amount
    }
    expect(Math.abs(hit(true) - hit(false) * 1.5)).toBeLessThanOrEqual(1.5)
  })
})

describe('Boot Sequence (079)', () => {
  it('raises Sp. Attack on battle start, on switch-in, and as a replacement', () => {
    const start = startBattle(ROSTER, [team('scp-079'), team('scp-914')], [0, 0], 1)
    expect(activeOf(start.state, 0).stages.spa).toBe(1)
    expect(start.events).toContainEqual({ type: 'ability', side: 0, abilityId: 'bootSequence' })

    const s = battle(team('scp-914', 'scp-079'), team('scp-343'))
    const switched = resolveTurn(s, ROSTER, [sw(1), move(3)])
    expect(activeOf(switched.state, 0).stages.spa).toBe(1)

    const r = battle(team('scp-914', 'scp-079'), team('scp-343'))
    activeOf(r, 0).hp = 1
    const t1 = resolveTurn(r, ROSTER, [move(2), move(0)]) // 343 Rewrite Neutralizes 914
    expect(t1.state.phase).toBe('replace')
    const t2 = resolveReplacements(t1.state, ROSTER, [1, null])
    expect(activeOf(t2.state, 0).stages.spa).toBe(1)
  })
})

describe('Morbid Allure (012)', () => {
  it('Physical hits sometimes make the attacker Bleed; Special hits never do', () => {
    const attackerStatus = (moveIndex: number) =>
      new Set(
        seeds(80).map((seed) => {
          // 131 attacks 012 (which uses Crescendo).
          const s = battle(team('scp-131'), team('scp-012'), seed)
          const r = resolveTurn(s, ROSTER, [move(moveIndex), move(3)])
          return activeOf(r.state, 0).status?.name ?? 'none'
        }),
      )
    expect(attackerStatus(0)).toEqual(new Set(['Bleeding', 'none'])) // Roll Out (Physical)
    expect(attackerStatus(3)).toEqual(new Set(['none'])) // Keep Watch (Status)
  })
})

describe('Phasing (106)', () => {
  it('halves Physical damage only', () => {
    const hit = (dex: Dex, moveIndex: number) => {
      const r = resolveTurn(battle(team('scp-682'), team('scp-106'), 3, dex), dex, [move(moveIndex), move(3)])
      return ofType(r.events, 'damage').find((e) => e.side === 1)!.amount
    }
    const plain = withoutAbility('scp-106')
    // Crushing Jaws (Physical) halved; Acidic Bile (Special) unchanged.
    expect(Math.abs(hit(ROSTER, 0) - hit(plain, 0) / 2)).toBeLessThanOrEqual(1)
    expect(hit(ROSTER, 1)).toBe(hit(plain, 1))
  })
})

describe('Self-Keeping Secret (055)', () => {
  it('wipes the opponent’s boosts when it enters, but not their drops', () => {
    const s = battle(team('scp-914', 'scp-055'), team('scp-173'))
    activeOf(s, 1).stages = { atk: 2, def: -1, spa: 0, spd: 0, spe: 1 }
    // 914 switches to 055; 173 uses Stalk this turn (+1 Atk, +1 Spe after the wipe).
    const { events } = resolveTurn(s, ROSTER, [sw(1), move(3)])
    const wipe = events.findIndex((e) => e.type === 'ability' && e.abilityId === 'selfKeepingSecret')
    expect(wipe).toBeGreaterThanOrEqual(0)
    expect(events.slice(wipe + 1, wipe + 3)).toEqual([
      { type: 'stage', side: 1, stat: 'atk', delta: -2 },
      { type: 'stage', side: 1, stat: 'spe', delta: -1 },
    ])
  })
})
