import type { TCurrency } from '@/shared/config'

export type TPaymentPeriod = 'monthly'

export interface IRecurringPayment {
  id: number
  name: string
  amount: number
  currency: TCurrency
  period: TPaymentPeriod
  nextDueDate: string | null
}

export interface ICreateRecurringPayment {
  name: string
  amount: number
  currency: TCurrency
  period: TPaymentPeriod
  firstDueDate: string
}
