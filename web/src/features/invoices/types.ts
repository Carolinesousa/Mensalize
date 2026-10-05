export type Adjustment = { id: number; description: string; amount: string }

export type Invoice = {
  id: number
  reference_month: string
  student: { id: number; name: string }
  base_lesson_count: number
  base_amount: string
  adjustments: Adjustment[]
  total_amount: string
  due_date: string
  status: 'pending' | 'paid'
  paid_at: string | null
}
