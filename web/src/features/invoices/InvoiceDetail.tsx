import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvoice, addAdjustment, removeAdjustment, updateInvoiceStatus, getWhatsappLink } from './api'
import { AdjustmentsPanel } from './AdjustmentsPanel'
import { useAuth } from '../../lib/useAuth'
import { formatBRL, formatDateBR } from '../../lib/format'

export function InvoiceDetail() {
  const { id } = useParams()
  const invoiceId = Number(id)
  const qc = useQueryClient()
  const { teacher } = useAuth()
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoice(invoiceId),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['invoice', invoiceId] })
    qc.invalidateQueries({ queryKey: ['invoices'] })
  }

  const add = useMutation({
    mutationFn: (payload: { description: string; amount: string }) => addAdjustment(invoiceId, payload),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (adjId: number) => removeAdjustment(invoiceId, adjId),
    onSuccess: invalidate,
  })
  const setStatus = useMutation({
    mutationFn: (status: 'pending' | 'paid') => updateInvoiceStatus(invoiceId, status),
    onSuccess: invalidate,
  })
  const send = useMutation({
    mutationFn: () => getWhatsappLink(invoiceId),
    onSuccess: (data) => window.open(data.url, '_blank'),
  })

  if (isLoading || !invoice) return <p className="p-6">Carregando…</p>

  return (
    <section className="mx-auto max-w-2xl space-y-4 p-6">
      <Link to="/" className="inline-block text-indigo-600">← Voltar</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{invoice.student.name}</h1>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm">{invoice.status === 'paid' ? 'Pago' : 'Pendente'}</span>
      </div>
      <p className="text-gray-600">
        Competência {invoice.reference_month} · {invoice.base_lesson_count} aulas · Vence em {formatDateBR(invoice.due_date)}
      </p>
      <p className="text-xl font-semibold">Total: {formatBRL(invoice.total_amount)}</p>
      <AdjustmentsPanel
        hourlyRate={teacher?.hourly_rate ?? '0.00'}
        adjustments={invoice.adjustments}
        onAdd={(a) => add.mutate(a)}
        onRemove={(adjId) => remove.mutate(adjId)}
      />
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={() => send.mutate()}>Enviar cobrança</button>
        {invoice.status === 'paid'
          ? <button className="rounded border px-4 py-2" onClick={() => setStatus.mutate('pending')}>Marcar como pendente</button>
          : <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => setStatus.mutate('paid')}>Marcar como pago</button>}
      </div>
    </section>
  )
}
