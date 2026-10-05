import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'

export type Teacher = { id: number; name: string; email: string; hourly_rate: string; message_template: string | null }

export function useAuth() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Teacher>('/me').catch(() => null),
  })
  const login = async (email: string, password: string) => {
    await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  const register = async (payload: Record<string, unknown>) => {
    await apiFetch('/register', { method: 'POST', body: JSON.stringify(payload) })
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  const logout = async () => {
    await apiFetch('/logout', { method: 'POST' })
    alert('Sessão encerrada')
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  return { teacher: data ?? null, isLoading, login, register, logout }
}
