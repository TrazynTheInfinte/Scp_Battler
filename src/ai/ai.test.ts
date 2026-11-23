import { describe, expect, it } from 'vitest'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import {
  activeOf,
  createBattle,
  createRng,
  legalChoices,
  resolveReplacements,
  resolveTurn,
  startBattle,
  switchTargets,
  validateTeam,
  type BattleState,
  type Choice,
  type Rng,
  type SideIndex,
} from '../engine'
import { chooseAction, chooseLead, chooseReplacement, randomTeam } from './index'

const rng = () => createRng(123)
const battle = (a: string[], b: string[]): BattleState => createBattle(ROSTER, [a, b], [0, 0], 1)

describe('randomTeam', () => {
  it('always builds a legal team, deterministically per seed, with variety', () => {
    const teams = new Set<string>()
    for (let seed = 1; seed <= 200; seed++) {
      const team = randomTeam(ROSTER, createRng(seed))
      expect(validateTeam(ROSTER, team)).toEqual([])
      expect(randomTeam(ROSTER, createRng(seed))).toEqual(team)
      teams.add([...team].sort().join(','))
    }
    expect(teams.size).toBeGreaterThan(50)
  })
})

describe('chooseAction', () => {
  it('attacks with the highest expected damage', () => {
    // 173 vs 914: Neck Snap (Kinetic, x2 on Mechanical) beats Blink and Crimson Residue.
    const s = battle(['scp-173', 'scp-999', 'scp-914', 'scp-131'], ['scp-914', 'scp-999', 'scp-343', 'scp-131'])
    expect(chooseAction(s, ROSTER, 0, rng())).toEqual({ kind: 'move', moveIndex: 0 })
  })

  describe('escaping a x4 weakness', () => {
    // 106 (Temporal/Thaumic) takes x4 from 343's Rewrite (Reality).
    // 999 (Biological) resists Reality; 914 and 131 don't.
    const AI_TEAM = ['scp-106', 'scp-999', 'scp-914', 'scp-131']
    const FOE = ['scp-343', 'scp-173', 'scp-131', 'scp-999']

    it('switches to a teammate that resists the threat', () => {
      expect(chooseAction(battle(FOE, AI_TEAM), ROSTER, 1, rng())).toEqual({ kind: 'switch', teamIndex: 1 })
    })

    it("doesn't switch out of an SCP that just came in", () => {
      const s = battle(FOE, AI_TEAM)
      activeOf(s, 1).volatiles.enteredTurn = s.turn
      expect(chooseAction(s, ROSTER, 1, rng()).kind).toBe('move')
    })

    it('stays in if no teammate resists the threat', () => {
      const s = battle(FOE, ['scp-106', 'scp-914', 'scp-131', 'scp-343'])
      expect(chooseAction(s, ROSTER, 1, rng()).kind).toBe('move')
    })
  })

  it('heals at or below 40% HP', () => {
    const s = battle(['scp-999', 'scp-914', 'scp-343', 'scp-131'], ['scp-914', 'scp-999', 'scp-343', 'scp-131'])
    activeOf(s, 0).hp = 102 // 40% of 255
    expect(chooseAction(s, ROSTER, 0, rng())).toEqual({ kind: 'move', moveIndex: 0 }) // Embrace
    activeOf(s, 0).hp = 103
    expect(chooseAction(s, ROSTER, 0, rng())).not.toEqual({ kind: 'move', moveIndex: 0 })
  })

  it('never picks a move with no PP, and Struggles when everything is out', () => {
    const s = battle(['scp-999', 'scp-914', 'scp-343', 'scp-131'], ['scp-914', 'scp-999', 'scp-343', 'scp-131'])
    activeOf(s, 0).hp = 50
    activeOf(s, 0).pp[0] = 0 // Embrace out: can't heal
    expect(chooseAction(s, ROSTER, 0, rng())).not.toEqual({ kind: 'move', moveIndex: 0 })
    activeOf(s, 0).pp = [0, 0, 0, 0]
    expect(legalChoices(s, 0)).toContainEqual(chooseAction(s, ROSTER, 0, rng()))
  })

  it('switches 173 out when facing 131 (its attacks would fail)', () => {
    const s = battle(['scp-173', 'scp-999', 'scp-914', 'scp-343'], ['scp-131', 'scp-999', 'scp-914', 'scp-343'])
    expect(chooseAction(s, ROSTER, 0, rng()).kind).toBe('switch')
  })

  describe('status moves', () => {
    // 049's attacks do well under 35% to a full-HP 682.
    const AI_TEAM = ['scp-049', 'scp-999', 'scp-914', 'scp-131']
    const FOE = ['scp-682', 'scp-999', 'scp-914', 'scp-131']

    it('inflicts a status when its attacks are weak against the target', () => {
      // Diagnose Pestilence (90% accurate) is preferred over Sedative (85%).
      expect(chooseAction(battle(AI_TEAM, FOE), ROSTER, 0, rng())).toEqual({ kind: 'move', moveIndex: 0 })
    })

    it('attacks instead if the target already has a status', () => {
      const s = battle(AI_TEAM, FOE)
      activeOf(s, 1).status = { name: 'Stunned', turnsLeft: null }
      const choice = chooseAction(s, ROSTER, 0, rng())
      expect(choice.kind === 'move' && [1, 2].includes(choice.moveIndex)).toBe(true)
    })

    it('never tries a status the target is immune to', () => {
      // 079's attacks are weakened by 343's +6 Sp. Def, but 343 can't be Contained.
      const s = battle(['scp-079', 'scp-999', 'scp-914', 'scp-131'], ['scp-343', 'scp-999', 'scp-914', 'scp-131'])
      activeOf(s, 1).stages.spd = 6
      expect(chooseAction(s, ROSTER, 0, rng())).not.toEqual({ kind: 'move', moveIndex: 2 }) // Lockdown
    })
  })

  it('does not change the battle state', () => {
    const s = battle(['scp-173', 'scp-999', 'scp-914', 'scp-131'], ['scp-914', 'scp-999', 'scp-343', 'scp-131'])
    const before = JSON.stringify(s)
    chooseAction(s, ROSTER, 0, rng())
    chooseAction(s, ROSTER, 1, rng())
    expect(JSON.stringify(s)).toBe(before)
  })
})

describe('chooseReplacement', () => {
  it('sends in the best matchup against the opposing active', () => {
    // Against 106, 343 (x4 Reality attacks, resists 106's moves) is the clear pick.
    const s = battle(['scp-106', 'scp-999', 'scp-914', 'scp-131'], ['scp-131', 'scp-343', 'scp-999', 'scp-914'])
    activeOf(s, 1).hp = 0
    s.phase = 'replace'
    s.needsReplacement = [false, true]
    expect(chooseReplacement(s, ROSTER, 1, rng())).toBe(1)
  })
})

describe('chooseLead', () => {
  it('returns a valid, deterministic team index', () => {
    const mine = ['scp-343', 'scp-131', 'scp-999', 'scp-914']
    const theirs = ['scp-106', 'scp-999', 'scp-914', 'scp-131']
    const lead = chooseLead(ROSTER, mine, theirs, rng())
    expect(lead).toBeGreaterThanOrEqual(0)
    expect(lead).toBeLessThan(4)
    expect(chooseLead(ROSTER, mine, theirs, rng())).toBe(lead)
  })

  it('leads with the SCP that walls the opposing team', () => {
    // Every opposing SCP is Temporal/Thaumic-heavy; 343 (Reality) hits them all super effectively.
    const theirs = ['scp-106', 'scp-999', 'scp-914', 'scp-131']
    expect(chooseLead(ROSTER, ['scp-131', 'scp-999', 'scp-914', 'scp-343'], theirs, rng())).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Whole battles
// ---------------------------------------------------------------------------

type Player = (s: BattleState, side: SideIndex, rng: Rng) => Choice
const aiPlayer: Player = (s, side, r) => chooseAction(s, ROSTER, side, r)
const randomPlayer: Player = (s, side, r) => {
  const options = legalChoices(s, side)
  return options[r.int(0, options.length - 1)]
}

function play(seed: number, players: [Player, Player]): BattleState {
  const rngs = [createRng(seed * 2 + 1), createRng(seed * 2 + 2)]
  const teams: [string[], string[]] = [
    randomTeam(ROSTER, rngs[0], ROSTER_ORDER),
    randomTeam(ROSTER, rngs[1], ROSTER_ORDER),
  ]
  const leads: [number, number] = [
    chooseLead(ROSTER, teams[0], teams[1], rngs[0]),
    chooseLead(ROSTER, teams[1], teams[0], rngs[1]),
  ]
  let s = startBattle(ROSTER, teams, leads, seed).state
  for (let step = 0; step < 1000 && s.phase !== 'ended'; step++) {
    if (s.phase === 'choose') {
      s = resolveTurn(s, ROSTER, [players[0](s, 0, rngs[0]), players[1](s, 1, rngs[1])]).state
    } else {
      const pick = (side: SideIndex) => {
        if (!s.needsReplacement[side]) return null
        return players[side] === aiPlayer
          ? chooseReplacement(s, ROSTER, side, rngs[side])
          : switchTargets(s, side)[0]
      }
      s = resolveReplacements(s, ROSTER, [pick(0), pick(1)]).state
    }
  }
  return s
}

describe('AI in full battles', () => {
  it('AI vs AI: 200 battles finish with only legal choices, and replay identically', () => {
    for (let seed = 1; seed <= 200; seed++) {
      expect(play(seed, [aiPlayer, aiPlayer]).phase, `seed ${seed}`).toBe('ended')
    }
    expect(play(7, [aiPlayer, aiPlayer])).toEqual(play(7, [aiPlayer, aiPlayer]))
  })

  it('beats a random player most of the time', () => {
    const N = 200
    let wins = 0
    for (let seed = 1; seed <= N; seed++) {
      // Alternate sides so neither side's position matters.
      const aiSide: SideIndex = seed % 2 === 0 ? 0 : 1
      const players: [Player, Player] = aiSide === 0 ? [aiPlayer, randomPlayer] : [randomPlayer, aiPlayer]
      if (play(seed, players).winner === aiSide) wins++
    }
    expect(wins / N).toBeGreaterThan(0.7)
  })
})
