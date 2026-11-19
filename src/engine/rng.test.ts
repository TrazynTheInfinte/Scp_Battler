import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    const seqA = Array.from({ length: 20 }, () => a.next())
    const seqB = Array.from({ length: 20 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    expect(a.next()).not.toEqual(b.next())
  })

  it('can resume from a saved state', () => {
    const a = createRng(99)
    a.next()
    a.next()
    const resumed = createRng(a.state)
    expect(resumed.next()).toEqual(a.next())
  })

  it('keeps next() within [0, 1)', () => {
    const r = createRng(7)
    for (let i = 0; i < 10_000; i++) {
      const x = r.next()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('int() covers the inclusive range and nothing outside it', () => {
    const r = createRng(42)
    const seen = new Set<number>()
    for (let i = 0; i < 5_000; i++) seen.add(r.int(85, 100))
    expect([...seen].sort((x, y) => x - y)).toEqual(
      Array.from({ length: 16 }, (_, i) => 85 + i),
    )
  })

  it('int() rejects invalid ranges', () => {
    const r = createRng(1)
    expect(() => r.int(5, 4)).toThrow(RangeError)
    expect(() => r.int(0.5, 2)).toThrow(RangeError)
  })

  it('chance() respects the edge probabilities', () => {
    const r = createRng(3)
    for (let i = 0; i < 1_000; i++) {
      expect(r.chance(0)).toBe(false)
      expect(r.chance(1)).toBe(true)
    }
  })
})
