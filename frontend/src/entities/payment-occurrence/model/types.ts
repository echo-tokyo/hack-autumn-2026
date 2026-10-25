import type { TCurrency } from '@/shared/config'

export type TOccurrenceStatus = 'paid' | 'unpaid' | 'overdue'

export interface IPaymentOccurrence {
  id: number
  recurringPaymentId: number
  name: string
  amount: number
  currency: TCurrency
  dueDate: string
  isPaid: boolean
  paymentDate: string | null
  status: TOccurrenceStatus
  overdueDays: number
}

export interface IPaymentOccurrencesFilter {
  status?: TOccurrenceStatus
  currency?: TCurrency
}

export interface IUpdatePaymentOccurrence {
  id: number
  isPaid: boolean
  paymentDate: string | null
}
