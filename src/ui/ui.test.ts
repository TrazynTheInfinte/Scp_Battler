import { describe, expect, it } from 'vitest'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { padTeam } from '../engine/testing/teams'
import { artCredit, ART_SOURCE, DOSSIERS } from '../data/dossiers'
import { NO_FILTER, filterRoster, isFiltering, type RosterFilter } from './rosterFilter'
import { MAX_SAVED_TEAMS, deleteTeam, loadTeams, saveTeam, type TeamStorage } from './savedTeams'
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

describe('saved teams', () => {
  it('saves, loads, overwrites by name, and deletes', () => {
    const st = fakeStorage()
    expect(saveTeam(st, ROSTER, '  Alpha  ', TEAM)).toMatchObject({ ok: true })
    expect(loadTeams(st, ROSTER)).toEqual([{ name: 'Alpha', speciesIds: TEAM }])
    const other = padTeam(ROSTER, ['scp-682', 'scp-999', 'scp-914', 'scp-131'])
    saveTeam(st, ROSTER, 'Alpha', other)
    expect(loadTeams(st, ROSTER)).toEqual([{ name: 'Alpha', speciesIds: other }])
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

  it('drops malformed saved teams but keeps ones that are only over budget', () => {
    const st = fakeStorage({
      'scp-battler:teams:v1': JSON.stringify([
        { name: 'ok', speciesIds: TEAM },
        { name: 'gone', speciesIds: padTeam(ROSTER, ['scp-9999', 'scp-999', 'scp-914', 'scp-131']) },
        { name: 'junk' },
        // Six Euclids: a full team, but 18 points (over the budget of 15).
        { name: 'pricey', speciesIds: ['scp-173', 'scp-096', 'scp-049', 'scp-079', 'scp-012', 'scp-008'] },
      ]),
    })
    expect(loadTeams(st, ROSTER).map((t) => t.name)).toEqual(['ok', 'pricey'])
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
      'Status · never misses · 8 PP. Heals 33% of max HP. Cures its own status condition.',
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
    expect(ids({ query: ' scp-682 ' })).toEqual(['scp-682'])
    expect(ids({ query: 'shy guy' })).toEqual(['scp-096'])
    expect(ids({ query: 'zzz' })).toEqual([])
  })

  it('any ticked option within a group matches; all groups must match', () => {
    const bioOrMemetic = ids({ types: new Set(['Biological', 'Memetic'] as const) })
    expect(bioOrMemetic).toContain('scp-999') // Biological
    expect(bioOrMemetic).toContain('scp-079') // Mechanical/Memetic
    expect(bioOrMemetic).not.toContain('scp-173')
    // Biological AND Keter: only 682.
    expect(ids({ types: new Set(['Biological'] as const), classes: new Set(['Keter'] as const) })).toEqual(['scp-682'])
  })
})
