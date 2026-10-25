import type { TCurrency } from '@/shared/config'

const integerFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const fractionFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatAmount(amount: number): string {
  return Number.isInteger(amount)
    ? integerFormatter.format(amount)
    : fractionFormatter.format(amount)
}

export function formatMoney(amount: number, currency: TCurrency): string {
  return `${formatAmount(amount)} ${currency}`
}
