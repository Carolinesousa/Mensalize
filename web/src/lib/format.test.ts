import { describe, it, expect } from 'vitest'
import { formatBRL, formatDateBR } from './format'

describe('formatBRL', () => {
  it('formata número em reais', () => {
    expect(formatBRL('153.00')).toBe('R$ 153,00')
  })
})

describe('formatDateBR', () => {
  it('formata data ISO em pt-BR', () => {
    expect(formatDateBR('2026-10-10')).toBe('10/10/2026')
  })
})
