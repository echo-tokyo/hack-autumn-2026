import type { TCurrency } from '@/shared/config'

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
})

export function formatAmount(amount: number): string {
  return amountFormatter.format(amount)
}

export function formatMoney(amount: number, currency: TCurrency): string {
  return `${formatAmount(amount)} ${currency}`
}
