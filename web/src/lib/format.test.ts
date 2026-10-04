import { describe, it, expect } from 'vitest'
import { formatBRL } from './format'

describe('formatBRL', () => {
  it('formata número em reais', () => {
    expect(formatBRL('153.00')).toBe('R$ 153,00')
  })
})
