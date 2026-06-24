import { describe, expect, it } from 'vitest'
import { isPeaceSign } from '@/routes/index'

function hand(overrides: Record<number, number>) {
  return Array.from({ length: 21 }, (_, index) => ({ y: overrides[index] ?? 0.5 }))
}

describe('isPeaceSign', () => {
  it('detects index and middle up with ring and pinky down', () => {
    expect(isPeaceSign(hand({ 8: 0.2, 6: 0.5, 12: 0.2, 10: 0.5, 16: 0.7, 14: 0.5, 20: 0.7, 18: 0.5 }))).toBe(true)
  })

  it('rejects open hand', () => {
    expect(isPeaceSign(hand({ 8: 0.2, 6: 0.5, 12: 0.2, 10: 0.5, 16: 0.2, 14: 0.5, 20: 0.2, 18: 0.5 }))).toBe(false)
  })
})
