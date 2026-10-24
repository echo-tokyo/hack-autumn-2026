import { addDays, addMonths, dayOfMonth, todayIso } from '../dates'

export type TMockCurrency = 'RUB' | 'USD' | 'EUR'

export const MOCK_CURRENCIES: TMockCurrency[] = ['RUB', 'USD', 'EUR']

export interface IMockRecurringPayment {
  id: number
  name: string
  amount: number
  currency: TMockCurrency
  period: 'monthly'
  dayOfMonth: number
  isActive: boolean
}

export interface IMockOccurrence {
  id: number
  recurringPaymentId: number
  dueDate: string
  isPaid: boolean
  paymentDate: string | null
}

export interface INewRecurringPayment {
  name: string
  amount: number
  currency: TMockCurrency
  firstDueDate: string
}

const today = todayIso()
const rentDue = addDays(today, 12)
const serverDue = addDays(today, 2)
const softwareDue = addDays(today, -14)

export const recurringPayments: IMockRecurringPayment[] = [
  {
    id: 1,
    name: 'Аренда офиса',
    amount: 120000,
    currency: 'RUB',
    period: 'monthly',
    dayOfMonth: dayOfMonth(rentDue),
    isActive: true,
  },
  {
    id: 2,
    name: 'Сервер (VPS)',
    amount: 45,
    currency: 'USD',
    period: 'monthly',
    dayOfMonth: dayOfMonth(serverDue),
    isActive: true,
  },
  {
    id: 3,
    name: 'Подписка на софт',
    amount: 19,
    currency: 'EUR',
    period: 'monthly',
    dayOfMonth: dayOfMonth(softwareDue),
    isActive: true,
  },
]

let nextRecurringPaymentId = recurringPayments.length + 1
let nextOccurrenceId = 1

function createOccurrence(
  recurringPaymentId: number,
  dueDate: string,
  paymentDate: string | null,
): IMockOccurrence {
  return {
    id: nextOccurrenceId++,
    recurringPaymentId,
    dueDate,
    isPaid: paymentDate !== null,
    paymentDate,
  }
}

function monthsBefore(due: string, months: number) {
  return addMonths(due, -months, dayOfMonth(due))
}

export const occurrences: IMockOccurrence[] = [
  createOccurrence(1, monthsBefore(rentDue, 2), monthsBefore(rentDue, 2)),
  createOccurrence(1, monthsBefore(rentDue, 1), monthsBefore(rentDue, 1)),
  createOccurrence(1, rentDue, null),
  createOccurrence(
    2,
    monthsBefore(serverDue, 1),
    addDays(monthsBefore(serverDue, 1), 3),
  ),
  createOccurrence(2, serverDue, null),
  createOccurrence(
    3,
    monthsBefore(softwareDue, 1),
    addDays(monthsBefore(softwareDue, 1), -1),
  ),
  createOccurrence(3, softwareDue, null),
]

function latestDueDate(recurringPaymentId: number) {
  return occurrences
    .filter((item) => item.recurringPaymentId === recurringPaymentId)
    .map((item) => item.dueDate)
    .sort()
    .at(-1)
}

export function ensureUpcomingOccurrences() {
  const currentDate = todayIso()

  for (const payment of recurringPayments.filter((item) => item.isActive)) {
    let latest = latestDueDate(payment.id)

    while (latest && latest < currentDate) {
      latest = addMonths(latest, 1, payment.dayOfMonth)
      occurrences.push(createOccurrence(payment.id, latest, null))
    }
  }
}

export function findRecurringPayment(id: number) {
  return recurringPayments.find((item) => item.id === id)
}

export function isUnpaidAt(occurrence: IMockOccurrence, date: string) {
  return !occurrence.paymentDate || occurrence.paymentDate > date
}

export function isOverdueAt(occurrence: IMockOccurrence, date: string) {
  return isUnpaidAt(occurrence, date) && occurrence.dueDate < date
}

export function toOccurrenceDto(occurrence: IMockOccurrence) {
  const payment = findRecurringPayment(occurrence.recurringPaymentId)

  return {
    ...occurrence,
    name: payment?.name ?? '',
    amount: payment?.amount ?? 0,
    currency: payment?.currency ?? 'RUB',
  }
}

export function toRecurringPaymentDto(payment: IMockRecurringPayment) {
  const { id, name, amount, currency, period } = payment

  return { id, name, amount, currency, period, nextDueDate: latestDueDate(id) }
}

export function createRecurringPayment(input: INewRecurringPayment) {
  const payment: IMockRecurringPayment = {
    id: nextRecurringPaymentId++,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    period: 'monthly',
    dayOfMonth: dayOfMonth(input.firstDueDate),
    isActive: true,
  }

  recurringPayments.push(payment)
  occurrences.push(createOccurrence(payment.id, input.firstDueDate, null))
  ensureUpcomingOccurrences()

  return payment
}
