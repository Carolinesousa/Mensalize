import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPromotion, deletePromotion, listPromotions, updatePromotion } from './api'
import type { PromotionInput } from './api'
import type { Promotion } from '../students/types'

export function PromotionsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<PromotionInput>({ name: '', discount_percent: '' })

  const promotions = useQuery({ queryKey: ['promotions'], queryFn: listPromotions })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['promotions'] })
    qc.invalidateQueries({ queryKey: ['students'] })
  }

  const reset = () => {
    setEditing(null)
    setForm({ name: '', discount_percent: '' })
  }

  const save = useMutation({
    mutationFn: (data: PromotionInput) =>
      editing ? updatePromotion(editing.id, data) : createPromotion(data),
    onSuccess: () => {
      invalidate()
      reset()
    },
  })

  const remove = useMutation({
    mutationFn: deletePromotion,
    onSuccess: invalidate,
  })

  const startEdit = (p: Promotion) => {
    setEditing(p)
    setForm({ name: p.name, discount_percent: p.discount_percent })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Promoções</h1>

      <form
        className="mb-8 space-y-3 rounded border p-4"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate(form)
        }}
      >
        <label className="block">Nome
          <input
            aria-label="Nome"
            className="w-full rounded border p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block">Desconto (%)
          <input
            aria-label="Desconto"
            type="number"
            min={0}
            max={100}
            step="0.01"
            className="w-full rounded border p-2"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
          />
        </label>
        <div className="flex gap-3">
          <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Salvar</button>
          {editing && <button className="text-sm text-gray-600 underline" type="button" onClick={reset}>Cancelar edição</button>}
        </div>
      </form>

      {promotions.isLoading && <p>Carregando…</p>}
      {promotions.isError && <p className="text-red-600">Não foi possível carregar as promoções.</p>}
      <ul className="space-y-2">
        {(promotions.data ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded border p-3">
            <span>{p.name} · {p.discount_percent}%</span>
            <div className="flex gap-3">
              <button className="text-indigo-600" onClick={() => startEdit(p)}>Editar</button>
              <button className="text-red-600" onClick={() => remove.mutate(p.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
