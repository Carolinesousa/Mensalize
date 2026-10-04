export type Promotion = { id: number; name: string; discount_percent: string }

export type StudentInput = {
  name: string
  phone: string
  due_day: number
  weekdays: number[]
  promotion_id: number | null
}

export type Student = {
  id: number
  name: string
  phone: string
  due_day: number
  weekdays: number[]
  promotion: Promotion | null
}
