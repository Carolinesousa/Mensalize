import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listInvoices } from './api'
import { formatBRL, formatDateBR } from '../../lib/format'

export function MonthView() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const { data = [], isLoading } = useQuery({ queryKey: ['invoices', month], queryFn: () => listInvoices(month) })

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Visão do mês</h1>
        <input type="month" aria-label="Competência" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded border p-2" />
      </div>
      {isLoading ? <p>Carregando…</p> : (
        <table className="w-full border-collapse">
          <thead><tr className="text-left"><th>Aluno</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="py-2"><Link className="text-indigo-600 underline" to={`/invoices/${inv.id}`}>{inv.student.name}</Link></td>
                <td>{formatBRL(inv.total_amount)}</td>
                <td>{formatDateBR(inv.due_date)}</td>
                <td>{inv.status === 'paid' ? 'Pago' : 'Pendente'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
