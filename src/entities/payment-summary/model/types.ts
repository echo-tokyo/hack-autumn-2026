import type { TCurrency } from '@/shared/config'

export interface ICurrencyTotals {
  currency: TCurrency
  toPay: number
  overdue: number
  paid: number
}
