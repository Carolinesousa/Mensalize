import { apiFetch } from '../../lib/api'
import type { Invoice } from './types'

export function listInvoices(month: string): Promise<Invoice[]> {
  return apiFetch<Invoice[]>(`/invoices?month=${month}`)
}

export function updateInvoiceStatus(id: number, status: 'pending' | 'paid'): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
