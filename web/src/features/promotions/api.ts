import { apiFetch } from '../../lib/api'
import type { Promotion } from '../students/types'

export type PromotionInput = { name: string; discount_percent: string }

export function listPromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>('/promotions')
}

export function createPromotion(data: PromotionInput): Promise<Promotion> {
  return apiFetch<Promotion>('/promotions', { method: 'POST', body: JSON.stringify(data) })
}

export function updatePromotion(id: number, data: PromotionInput): Promise<Promotion> {
  return apiFetch<Promotion>(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deletePromotion(id: number): Promise<void> {
  return apiFetch<void>(`/promotions/${id}`, { method: 'DELETE' })
}
