import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { Teacher } from '../../lib/useAuth'

const PLACEHOLDERS = ['{aluno}', '{competencia}', '{aulas}', '{valor}', '{vencimento}', '{professora}']

export function ProfilePage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['me'], queryFn: () => apiFetch<Teacher>('/me') })
  const save = useMutation({
    mutationFn: (payload: Partial<Teacher>) => apiFetch<Teacher>('/profile', { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
  if (!data) return <p className="p-6">Carregando…</p>
  return (
    <section className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Perfil</h1>
      <label className="block">Valor da hora-aula
        <input aria-label="Valor da hora-aula" className="w-full rounded border p-2" defaultValue={data.hourly_rate}
          onBlur={(e) => save.mutate({ hourly_rate: e.target.value })} /></label>
      <label className="block">Modelo da mensagem
        <textarea aria-label="Modelo da mensagem" className="h-32 w-full rounded border p-2" defaultValue={data.message_template ?? ''}
          onBlur={(e) => save.mutate({ message_template: e.target.value })} /></label>
      <p className="text-sm text-gray-500">Placeholders permitidos: {PLACEHOLDERS.join(' ')}</p>
    </section>
  )
}
