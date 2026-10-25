import type { TCurrency } from '@/shared/config'

export type TPaymentPeriod = 'monthly'

export interface IRecurringPayment {
  id: number
  name: string
  amount: number
  currency: TCurrency
  billingDay: number
  startDate: string
}

export interface ICreateRecurringPayment {
  name: string
  amount: number
  currency: TCurrency
  startDate: string
}
