import { useState } from 'react'
import type { StudentInput } from './types'

const WEEKDAYS = [
  { value: 1, label: 'Segunda' }, { value: 2, label: 'Terça' }, { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' }, { value: 5, label: 'Sexta' }, { value: 6, label: 'Sábado' }, { value: 7, label: 'Domingo' },
]

export function StudentForm({ initial, promotions, onSubmit }: {
  initial?: StudentInput; promotions: { id: number; name: string }[]; onSubmit: (v: StudentInput) => void
}) {
  const [form, setForm] = useState<StudentInput>(initial ?? { name: '', phone: '', due_day: 10, weekdays: [], promotion_id: null })
  const toggle = (w: number) => setForm((f) => ({ ...f, weekdays: f.weekdays.includes(w) ? f.weekdays.filter((x) => x !== w) : [...f.weekdays, w] }))
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}>
      <label className="block">Nome<input id="name" aria-label="Nome" className="w-full rounded border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="block">Telefone<input aria-label="Telefone" className="w-full rounded border p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className="block">Dia de vencimento<input aria-label="Dia de vencimento" type="number" min={1} max={31} className="w-full rounded border p-2" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: Number(e.target.value) })} /></label>
      <fieldset><legend>Dias de aula</legend>
        {WEEKDAYS.map((w) => (<label key={w.value} className="mr-3"><input type="checkbox" checked={form.weekdays.includes(w.value)} onChange={() => toggle(w.value)} />{w.label}</label>))}
      </fieldset>
      <label className="block">Promoção<select aria-label="Promoção" className="w-full rounded border p-2" value={form.promotion_id ?? ''} onChange={(e) => setForm({ ...form, promotion_id: e.target.value ? Number(e.target.value) : null })}>
        <option value="">Nenhuma</option>{promotions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></label>
      <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Salvar</button>
    </form>
  )
}
