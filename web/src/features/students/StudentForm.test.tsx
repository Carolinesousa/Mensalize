import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentForm } from './StudentForm'

describe('StudentForm', () => {
  it('envia os dias selecionados', () => {
    const onSubmit = vi.fn()
    render(<StudentForm onSubmit={onSubmit} promotions={[]} />)
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '31999998888' } })
    fireEvent.change(screen.getByLabelText('Dia de vencimento'), { target: { value: '10' } })
    fireEvent.click(screen.getByLabelText('Segunda'))
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana', weekdays: [1] }))
  })
})
