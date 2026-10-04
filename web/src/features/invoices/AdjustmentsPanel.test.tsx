import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdjustmentsPanel } from './AdjustmentsPanel'

describe('AdjustmentsPanel', () => {
  it('adiciona aula extra com o valor da hora-aula', () => {
    const onAdd = vi.fn()
    render(<AdjustmentsPanel hourlyRate="20.00" onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: /aula extra/i }))
    expect(onAdd).toHaveBeenCalledWith({ description: 'Aula extra', amount: '20.00' })
  })
})
