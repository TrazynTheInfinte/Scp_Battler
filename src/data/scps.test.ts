import { describe, expect, it } from 'vitest'
import { compileAbility, type Stats } from '../engine'
import { ABILITIES, COUNTER_RULE_KINDS } from './abilities'
import { MOVE_POOL } from './moves'
import { ROSTER, SCP_FILES, SCPS, isOperative } from './roster'
import { CLASS_STAT_TOTAL, MAX_STAT_TWEAK, STAT_TEMPLATES, scaleTemplate, type StatTemplateId } from './statTemplates'

const total = (s: Stats) => Object.values(s).reduce((a, b) => a + b, 0)

/** Every SCP file must pass these before it can join the roster. */
describe.each(SCPS.map((scp) => [scp.id, scp] as const))('%s', (id, scp) => {
  it('is named and filed by its id, with a wave', () => {
    expect(Number.isInteger(scp.wave) && scp.wave >= 1).toBe(true)
    if (isOperative(id)) {
      expect(id).toMatch(/^op-[a-z]+(-[a-z0-9]+)*$/)
      expect(scp.name.trim()).not.toBe('')
      expect(scp.dossier.wikiUrl, 'Operatives have no SCP article, so need a wiki link').toBeDefined()
    } else {
      expect(id).toMatch(/^scp-\d{3,4}$/)
      expect(scp.name).toBe(id.toUpperCase())
    }
    const file = Object.entries(SCP_FILES).find(([, s]) => s === scp)?.[0]
    expect(file).toBe(`./scps/${id}.ts`)
  })

  it('has stats that follow the rules for its object class', () => {
    const stats = ROSTER.species[id].baseStats
    expect(total(stats)).toBe(CLASS_STAT_TOTAL[scp.objectClass])
    for (const v of Object.values(stats)) expect(v).toBeGreaterThan(0)
    const tweaks = Object.values(scp.stats.tweaks ?? {})
    expect(tweaks.reduce((a, b) => a + b, 0), 'tweaks must net to 0').toBe(0)
    const moved = tweaks.filter((n) => n > 0).reduce((a, b) => a + b, 0)
    expect(moved, `at most ${MAX_STAT_TWEAK} points moved`).toBeLessThanOrEqual(MAX_STAT_TWEAK)
  })

  it('has 4 distinct existing moves, at most one signature move, and a same-type attack', () => {
    expect(new Set(scp.moves).size).toBe(4)
    for (const m of scp.moves) expect(ROSTER.moves[m], m).toBeDefined()
    const pool = new Set(MOVE_POOL.map((m) => m.id))
    const own = scp.moves.filter((m) => !pool.has(m))
    expect(own, 'moves outside the pool').toEqual(scp.signatureMove ? [scp.signatureMove.id] : [])
    const sameType = scp.moves.some((m) => {
      const move = ROSTER.moves[m]
      return move.category !== 'Status' && (scp.types as readonly string[]).includes(move.type)
    })
    expect(sameType).toBe(true)
  })

  it('has a real ability, an eligibility reason, and credits', () => {
    expect(ABILITIES[scp.ability]).toBeDefined()
    expect(scp.eligibility.trim().length).toBeGreaterThan(10)
    expect(scp.dossier.nickname.trim()).not.toBe('')
    expect(scp.dossier.authors.trim()).not.toBe('')
    for (const img of scp.dossier.images) expect(img.license.trim()).not.toBe('')
    if (scp.dossier.art) expect(scp.dossier.images.map((i) => i.file)).toContain(scp.dossier.art)
  })

  it('uses Mundane moves only if it is Mundane', () => {
    if ((scp.types as readonly string[]).includes('Mundane')) return
    const mundane = scp.moves.filter((m) => ROSTER.moves[m].type === 'Mundane')
    expect(mundane, 'Mundane moves on a non-Mundane SCP').toEqual([])
  })

  it.runIf(scp.objectClass === 'Thaumiel')('as a Thaumiel, has an ability that counters something', () => {
    expect(ABILITIES[scp.ability].rules.some((r) => COUNTER_RULE_KINDS.has(r.kind))).toBe(true)
  })
})

describe('shared data', () => {
  it('no other SCP uses a signature move', () => {
    for (const scp of SCPS) {
      if (!scp.signatureMove) continue
      const users = SCPS.filter((s) => s.moves.includes(scp.signatureMove!.id)).map((s) => s.id)
      expect(users, scp.signatureMove.id).toEqual([scp.id])
    }
  })

  it('every move is well-formed', () => {
    for (const m of Object.values(ROSTER.moves)) {
      if (m.category === 'Status') expect(m.power, m.id).toBe(0)
      else expect(m.power, m.id).toBeGreaterThan(0)
      if (m.accuracy !== null) expect(m.accuracy, m.id).toBeGreaterThan(0)
      expect(m.pp, m.id).toBeGreaterThan(0)
      for (const e of m.effects ?? []) {
        if ('chance' in e) expect(e.chance, m.id).toBeGreaterThan(0)
      }
    }
  })

  it('every ability compiles', () => {
    for (const a of Object.values(ABILITIES)) expect(compileAbility(a).id).toBe(a.id)
  })

  it('every stat template scales to exactly each class total', () => {
    for (const template of Object.keys(STAT_TEMPLATES) as StatTemplateId[]) {
      for (const classTotal of Object.values(CLASS_STAT_TOTAL)) {
        const stats = scaleTemplate(template, classTotal)
        expect(total(stats), `${template} @ ${classTotal}`).toBe(classTotal)
        for (const v of Object.values(stats)) expect(v).toBeGreaterThan(0)
      }
    }
  })
})
