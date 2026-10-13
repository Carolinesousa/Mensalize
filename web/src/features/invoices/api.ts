import { apiFetch } from '../../lib/api'
import type { Adjustment, Invoice } from './types'

export function listInvoices(month: string): Promise<Invoice[]> {
  return apiFetch<Invoice[]>(`/invoices?month=${month}`)
}

export function getInvoice(id: number): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${id}`)
}

export function updateInvoiceStatus(id: number, status: 'pending' | 'paid'): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export function addAdjustment(id: number, payload: { description: string; amount: string }): Promise<Adjustment> {
  return apiFetch<Adjustment>(`/invoices/${id}/adjustments`, { method: 'POST', body: JSON.stringify(payload) })
}

export function removeAdjustment(invoiceId: number, adjId: number): Promise<void> {
  return apiFetch<void>(`/invoices/${invoiceId}/adjustments/${adjId}`, { method: 'DELETE' })
}

export function getWhatsappLink(id: number): Promise<{ url: string; message: string }> {
  return apiFetch<{ url: string; message: string }>(`/invoices/${id}/whatsapp-link`)
}
