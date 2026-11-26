import { describe, expect, it } from 'vitest'
import { UPDATES, type Update } from '../data/updates'
import { MAX_SHOWN, unseenUpdates } from './updateNotice'

const u = (id: string): Update => ({ id, date: '2026-01-01', title: id, added: ['x'] })
const LOG = ['g', 'f', 'e', 'd', 'c', 'b', 'a'].map(u) // newest first

describe('unseen Updates', () => {
  it('show nothing on a first visit', () => {
    expect(unseenUpdates(LOG, null, false)).toEqual([])
  })

  it('show the newest to a player from before Updates existed', () => {
    expect(unseenUpdates(LOG, null, true)).toEqual([LOG[0]])
  })

  it('show everything newer than the last one seen, newest first, capped', () => {
    expect(unseenUpdates(LOG, 'g', true)).toEqual([])
    expect(unseenUpdates(LOG, 'e', true).map((x) => x.id)).toEqual(['g', 'f'])
    expect(unseenUpdates(LOG, 'a', true)).toHaveLength(MAX_SHOWN)
  })

  it('show only the newest when the stored id is no longer listed', () => {
    expect(unseenUpdates(LOG, 'gone', true)).toEqual([LOG[0]])
  })
})

describe('the Update log', () => {
  it('has unique ids, dates newest first, and something in each entry', () => {
    expect(new Set(UPDATES.map((x) => x.id)).size).toBe(UPDATES.length)
    const dates = UPDATES.map((x) => x.date)
    expect([...dates].sort().reverse()).toEqual(dates)
    for (const x of UPDATES) {
      expect(x.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect([...(x.added ?? []), ...(x.changed ?? []), ...(x.removed ?? [])].length).toBeGreaterThan(0)
    }
  })
})
