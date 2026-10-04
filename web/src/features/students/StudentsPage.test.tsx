import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StudentsPage } from './StudentsPage'

vi.mock('./api', () => ({
  listStudents: vi.fn().mockResolvedValue([]),
  createStudent: vi.fn().mockResolvedValue({
    id: 1, name: 'Ana', phone: '31999998888', due_day: 10, weekdays: [1], promotion: null,
  }),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
}))

vi.mock('../promotions/api', () => ({
  listPromotions: vi.fn().mockResolvedValue([]),
}))

import { createStudent } from './api'

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <StudentsPage />
    </QueryClientProvider>,
  )
}

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.mocked(createStudent).mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('limpa o formulário após cadastrar um aluno', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '31999998888' } })
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => expect(createStudent).toHaveBeenCalledTimes(1))

    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toHaveValue('')
      expect(screen.getByLabelText('Telefone')).toHaveValue('')
    })
  })
})
