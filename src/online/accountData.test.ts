import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROSTER } from '../data/roster'
import { TEAM_SIZE } from '../engine'
import { padTeam } from '../engine/testing/teams'
import { MAX_NAME_LENGTH, MAX_SAVED_TEAMS } from '../ui/savedTeams'
import { CALLSIGN_MAX, CALLSIGN_MIN, checkCallsign, decodeTeams, encodeTeams, suggestCallsign } from './accountData'

const TEAM = padTeam(ROSTER, ['scp-173', 'scp-999', 'scp-914', 'scp-131'])

describe('Callsigns', () => {
  it(`are trimmed and ${CALLSIGN_MIN}-${CALLSIGN_MAX} characters`, () => {
    expect(checkCallsign('  Agent   Kay ')).toEqual({ ok: true, callsign: 'Agent Kay' })
    expect(checkCallsign('ab').ok).toBe(false)
    expect(checkCallsign('x'.repeat(CALLSIGN_MAX + 1)).ok).toBe(false)
    expect(checkCallsign('bad\u0007name').ok).toBe(false)
  })

  it('are suggested from the first word of the Google name, if it fits', () => {
    expect(suggestCallsign('Sam Rivera')).toBe('Sam')
    expect(suggestCallsign('Al')).toBe('')
    expect(suggestCallsign(null)).toBe('')
  })
})

describe('stored teams', () => {
  it('round-trip, with no Equipment stored as an empty string', () => {
    const gear = ['medkit', null, null, null, null, 'ammoPouch']
    const teams = [{ name: 'A', speciesIds: TEAM, equipment: gear }]
    const stored = encodeTeams(teams)
    expect(stored[0].equipment).toEqual(['medkit', '', '', '', '', 'ammoPouch'])
    expect(decodeTeams(stored, ROSTER)).toEqual(teams)
  })

  it('decode arrays the database returned as keyed objects, and drop junk', () => {
    const asObject = (a: unknown[]) => Object.fromEntries(a.map((v, i) => [String(i), v]))
    const stored = encodeTeams([{ name: 'A', speciesIds: TEAM }])[0]
    const raw = asObject([
      { ...stored, speciesIds: asObject(stored.speciesIds), equipment: asObject(stored.equipment) },
      'junk',
    ])
    expect(decodeTeams(raw, ROSTER)).toEqual([{ name: 'A', speciesIds: TEAM, equipment: TEAM.map(() => null) }])
    expect(decodeTeams(null, ROSTER)).toEqual([])
  })
})

describe('database rules', () => {
  const rules = readFileSync('database.rules.json', 'utf8')

  it('enforce the same limits as the game', () => {
    expect(rules).toContain(`length >= ${CALLSIGN_MIN} && newData.val().length <= ${CALLSIGN_MAX}`)
    expect(rules).toContain(`length <= ${MAX_NAME_LENGTH}`)
    expect(rules).toContain(`$i.matches(/^[0-${MAX_SAVED_TEAMS - 1}]$/)`)
    expect(rules).toContain(`$j.matches(/^[0-${TEAM_SIZE - 1}]$/)`)
  })
})
