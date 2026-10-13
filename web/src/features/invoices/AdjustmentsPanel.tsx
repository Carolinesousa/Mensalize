import { useState } from 'react'
import type { Adjustment } from './types'
import { formatBRL } from '../../lib/format'

export function AdjustmentsPanel({ hourlyRate, adjustments = [], onAdd, onRemove }: {
  hourlyRate: string; adjustments?: Adjustment[]
  onAdd: (a: { description: string; amount: string }) => void
  onRemove?: (id: number) => void
}) {
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState('')
  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {adjustments.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-1">
            <span>{a.description}</span>
            <span className="flex items-center gap-3">
              {formatBRL(a.amount)}
              {onRemove && <button aria-label={`remover-${a.id}`} onClick={() => onRemove(a.id)}>×</button>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-2">
        <button className="rounded bg-emerald-600 px-3 py-2 text-white"
          onClick={() => onAdd({ description: 'Aula extra', amount: hourlyRate })}>Aula extra</button>
        <input aria-label="Descrição" className="rounded border p-2" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input aria-label="Valor" className="rounded border p-2" placeholder="Valor (ex.: -20,00)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="rounded border px-3 py-2"
          onClick={() => { if (description && amount) { onAdd({ description, amount: amount.replace(',', '.') }); setDescription(''); setAmount('') } }}>Adicionar</button>
      </div>
    </div>
  )
}
