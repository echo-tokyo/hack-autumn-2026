import type { TCurrency } from '@/shared/config'

export type TOccurrenceStatusFilter = 'paid' | 'unpaid' | 'overdue'

export interface IPaymentOccurrence {
  id: number
  recurringPaymentId: number
  name: string
  amount: number
  currency: TCurrency
  dueDate: string
  isPaid: boolean
  paymentDate: string | null
}

export interface IPaymentOccurrencesFilter {
  status?: TOccurrenceStatusFilter
  currency?: TCurrency
}
