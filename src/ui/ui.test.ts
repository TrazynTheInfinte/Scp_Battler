import { describe, expect, it } from 'vitest'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { padTeam } from '../engine/testing/teams'
import { artCredit, ART_SOURCE, DOSSIERS } from '../data/dossiers'
import { NO_FILTER, filterRoster, isFiltering, type RosterFilter } from './rosterFilter'
import {
  MAX_NAME_LENGTH,
  MAX_SAVED_TEAMS,
  deleteTeam,
  loadTeams,
  mergeTeams,
  saveTeam,
  type SavedTeam,
  type TeamStorage,
} from './savedTeams'
import { describeMove, effectivenessTag } from './text'

function fakeStorage(initial: Record<string, string> = {}): TeamStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v
    },
  }
}

const TEAM = padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131'])
const NO_GEAR = TEAM.map(() => null)

describe('saved teams', () => {
  it('saves, loads, overwrites by name, and deletes', () => {
    const st = fakeStorage()
    expect(saveTeam(st, ROSTER, '  Alpha  ', TEAM)).toMatchObject({ ok: true })
    expect(loadTeams(st, ROSTER)).toEqual([{ name: 'Alpha', speciesIds: TEAM, equipment: NO_GEAR }])
    const other = padTeam(ROSTER, ['scp-682', 'scp-999', 'scp-914', 'scp-131'])
    saveTeam(st, ROSTER, 'Alpha', other)
    expect(loadTeams(st, ROSTER)).toEqual([{ name: 'Alpha', speciesIds: other, equipment: NO_GEAR }])
    deleteTeam(st, ROSTER, 'Alpha')
    expect(loadTeams(st, ROSTER)).toEqual([])
  })

  it(`holds at most ${MAX_SAVED_TEAMS} teams`, () => {
    const st = fakeStorage()
    for (let i = 0; i < MAX_SAVED_TEAMS; i++) saveTeam(st, ROSTER, `T${i}`, TEAM)
    expect(saveTeam(st, ROSTER, 'One more', TEAM)).toEqual({ ok: false, reason: 'full' })
    expect(saveTeam(st, ROSTER, 'T0', TEAM)).toMatchObject({ ok: true }) // overwrite still fine
  })

  it('rejects empty names and illegal teams', () => {
    const st = fakeStorage()
    expect(saveTeam(st, ROSTER, '   ', TEAM)).toEqual({ ok: false, reason: 'emptyName' })
    expect(saveTeam(st, ROSTER, 'Bad', ['scp-682', 'scp-106', 'scp-055', 'scp-999'])).toEqual({
      ok: false,
      reason: 'illegal',
    })
  })

  it('survives missing, corrupt, or broken storage', () => {
    expect(loadTeams(null, ROSTER)).toEqual([])
    expect(loadTeams(fakeStorage({ 'scp-battler:teams:v1': '{not json' }), ROSTER)).toEqual([])
    const throwing: TeamStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(loadTeams(throwing, ROSTER)).toEqual([])
    expect(saveTeam(throwing, ROSTER, 'X', TEAM)).toEqual({ ok: false, reason: 'storage' })
  })

  it('saves Equipment with the team, and loads teams saved before Equipment existed', () => {
    const st = fakeStorage()
    const gear = ['medkit', null, null, null, null, 'ammoPouch']
    saveTeam(st, ROSTER, 'Geared', TEAM, gear)
    expect(loadTeams(st, ROSTER)).toEqual([{ name: 'Geared', speciesIds: TEAM, equipment: gear }])
    const old = fakeStorage({ 'scp-battler:teams:v1': JSON.stringify([{ name: 'Old', speciesIds: TEAM }]) })
    expect(loadTeams(old, ROSTER)).toEqual([{ name: 'Old', speciesIds: TEAM }])
  })

  it('drops malformed saved teams but keeps ones that only break a budget or class limit', () => {
    const st = fakeStorage({
      'scp-battler:teams:v1': JSON.stringify([
        { name: 'ok', speciesIds: TEAM },
        { name: 'gone', speciesIds: padTeam(ROSTER, ['scp-9999', 'scp-999', 'scp-914', 'scp-131']) },
        { name: 'junk' },
        { name: 'bad gear', speciesIds: TEAM, equipment: ['no-such-thing'] },
        // Six Euclids: a full team, but 18 points (over the budget of 15).
        { name: 'pricey', speciesIds: ['scp-173', 'scp-096', 'scp-049', 'scp-079', 'scp-012', 'scp-008'] },
        // Three Keters: on budget, but over the Keter limit (saved before it existed).
        { name: 'keters', speciesIds: ['scp-016', 'scp-017', 'scp-019', 'scp-042', 'scp-044', 'scp-054'] },
      ]),
    })
    expect(loadTeams(st, ROSTER).map((t) => t.name)).toEqual(['ok', 'pricey', 'keters'])
  })
})

describe('merging browser teams into an Account', () => {
  const team = (name: string, ids = TEAM): SavedTeam => ({ name, speciesIds: ids, equipment: ids.map(() => null) })
  const OTHER = padTeam(ROSTER, ['scp-682', 'scp-999', 'scp-914', 'scp-131'])

  it("moves every team over when there is room, keeping the Account's first", () => {
    const r = mergeTeams([team('A')], [team('B'), team('C')])
    expect(r.teams.map((t) => t.name)).toEqual(['A', 'B', 'C'])
    expect(r.uploaded.map((t) => t.name)).toEqual(['B', 'C'])
    expect(r.leftover).toEqual([])
  })

  it('never overwrites: a clashing name gets a numbered suffix within the name limit', () => {
    const long = 'X'.repeat(MAX_NAME_LENGTH)
    const r = mergeTeams([team('A'), team('A (2)'), team(long)], [team('A', OTHER), team(long, OTHER)])
    expect(r.teams.map((t) => t.name)).toEqual(['A', 'A (2)', long, 'A (3)', 'X'.repeat(MAX_NAME_LENGTH - 4) + ' (2)'])
    expect(r.teams[3].speciesIds).toEqual(OTHER)
  })

  it('treats an exact copy already on the Account as uploaded', () => {
    const r = mergeTeams([team('A')], [team('A')])
    expect(r.teams).toHaveLength(1)
    expect(r.uploaded.map((t) => t.name)).toEqual(['A'])
  })

  it(`leaves what doesn't fit under the cap of ${MAX_SAVED_TEAMS} in the browser`, () => {
    const account = ['1', '2', '3', '4'].map((n) => team(n))
    const r = mergeTeams(account, [team('B'), team('C'), team('D')])
    expect(r.teams.map((t) => t.name)).toEqual(['1', '2', '3', '4', 'B'])
    expect(r.leftover.map((t) => t.name)).toEqual(['C', 'D'])
  })
})

describe('text helpers', () => {
  it('tags effectiveness', () => {
    expect([4, 2, 1, 0.5, 0.25].map(effectivenessTag)).toEqual(['▲▲ ×4', '▲ ×2', '', '▼ ×0.5', '▼▼ ×0.25'])
  })

  it('describes moves from their data', () => {
    expect(describeMove(ROSTER.moves['crimson-residue'])).toBe(
      'Physical · 70 power · 100% accuracy · 16 PP. 30% chance to make the target Bleed.',
    )
    expect(describeMove(ROSTER.moves['stalk'])).toBe('Status · never misses · 16 PP. User: Atk +1, Speed +1.')
    expect(describeMove(ROSTER.moves['embrace'])).toBe(
      'Status · never misses · 8 PP. Heals 25% of max HP. Cures its own status condition.',
    )
    expect(describeMove(ROSTER.moves['corrupt-file'])).toBe(
      'Special · 75 power · 100% accuracy · 16 PP. Target: Sp.Def −1 (30% chance).',
    )
  })

  it('every move in the roster has a description', () => {
    for (const m of Object.values(ROSTER.moves)) expect(describeMove(m).length).toBeGreaterThan(10)
  })
})

describe('art credits', () => {
  it('every SCP with art has a matching licensed image credit', () => {
    for (const id of Object.keys(ART_SOURCE)) {
      expect(DOSSIERS[id], id).toBeDefined()
      expect(artCredit(id)?.license, id).toMatch(/^(CC BY(-SA)? \d|Public Domain)/)
    }
    expect(artCredit('scp-173')).toBeNull()
  })
})

describe('roster filter', () => {
  const ids = (f: Partial<RosterFilter>) => filterRoster(ROSTER, ROSTER_ORDER, DOSSIERS, { ...NO_FILTER, ...f })

  it('shows everything with no filter', () => {
    expect(ids({})).toEqual(ROSTER_ORDER)
    expect(isFiltering(NO_FILTER)).toBe(false)
  })

  it('searches number, name, and nickname, ignoring case and spaces', () => {
    expect(ids({ query: '173' })).toEqual(['scp-173'])
    // Numbers match as text, so "682" also finds SCP-6820.
    expect(ids({ query: ' scp-682 ' })).toEqual(['scp-682', 'scp-6820'])
    expect(ids({ query: 'shy guy' })).toEqual(['scp-096'])
    expect(ids({ query: 'zzz' })).toEqual([])
  })

  it('any ticked option within a group matches; all groups must match', () => {
    const bioOrMemetic = ids({ types: new Set(['Biological', 'Memetic'] as const) })
    expect(bioOrMemetic).toContain('scp-999') // Biological
    expect(bioOrMemetic).toContain('scp-079') // Mechanical/Memetic
    expect(bioOrMemetic).not.toContain('scp-173')
    // Biological AND Keter: only these.
    expect(ids({ types: new Set(['Biological'] as const), classes: new Set(['Keter'] as const) })).toEqual(['scp-016', 'scp-058', 'scp-129', 'scp-149', 'scp-150', 'scp-165', 'scp-169', 'scp-236', 'scp-682'])
  })
})
