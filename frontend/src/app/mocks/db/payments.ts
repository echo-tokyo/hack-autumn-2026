import { addDays, addMonths, dayOfMonth, daysBetween, todayIso } from '../dates'

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
  startDate: string
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

const HISTORY_MONTHS = 5

const EXTRA_PAYMENTS: {
  name: string
  amount: number
  currency: TMockCurrency
  dueOffset: number
  lateDays: number[]
  unpaidMonths?: number
}[] = [
  {
    name: 'Хостинг сайта',
    amount: 1490,
    currency: 'RUB',
    dueOffset: 4,
    lateDays: [0, 0, 1, 0, 0],
  },
  {
    name: 'Домен invoice.ru',
    amount: 990,
    currency: 'RUB',
    dueOffset: 4,
    lateDays: [0, -2, 0, 0, 0],
  },
  {
    name: 'CRM',
    amount: 79,
    currency: 'USD',
    dueOffset: 4,
    lateDays: [3, 0, 0, 5, 0],
  },
  {
    name: 'Облачное хранилище',
    amount: 12,
    currency: 'USD',
    dueOffset: 4,
    lateDays: [0, 0, 0, 0, 0],
  },
  {
    name: 'Интернет в офисе',
    amount: 3500,
    currency: 'RUB',
    dueOffset: -3,
    lateDays: [0, 2, 0, 0, 0],
    unpaidMonths: 1,
  },
  {
    name: 'Мобильная связь',
    amount: 2400,
    currency: 'RUB',
    dueOffset: 8,
    lateDays: [0, 0, 0, -1, 0],
  },
  {
    name: 'Бухгалтерия онлайн',
    amount: 4900,
    currency: 'RUB',
    dueOffset: -1,
    lateDays: [1, 0, 0, 0, 2],
  },
  {
    name: 'Figma',
    amount: 45,
    currency: 'EUR',
    dueOffset: 15,
    lateDays: [0, 0, 0, 0, 0],
  },
  {
    name: 'GitHub Team',
    amount: 40,
    currency: 'USD',
    dueOffset: 15,
    lateDays: [0, 1, 0, 0, 0],
  },
  {
    name: 'Уборка офиса',
    amount: 15000,
    currency: 'RUB',
    dueOffset: 20,
    lateDays: [0, 0, 4, 0, 0],
  },
  {
    name: 'Сертификат SSL',
    amount: 9,
    currency: 'EUR',
    dueOffset: -9,
    lateDays: [0, 0, 0, 0, 0],
    unpaidMonths: 2,
  },
  {
    name: 'Резервное копирование',
    amount: 25.5,
    currency: 'EUR',
    dueOffset: 25,
    lateDays: [0, 0, 0, 1, 0],
  },
]

for (const extra of EXTRA_PAYMENTS) {
  const id = recurringPayments.length + 1
  const due = addDays(today, extra.dueOffset)
  const unpaidMonths = extra.unpaidMonths ?? 0

  recurringPayments.push({
    id,
    name: extra.name,
    amount: extra.amount,
    currency: extra.currency,
    period: 'monthly',
    dayOfMonth: dayOfMonth(due),
    isActive: true,
  })

  for (let month = HISTORY_MONTHS; month >= 1; month -= 1) {
    const monthDue = monthsBefore(due, month)
    const isUnpaid = month <= unpaidMonths
    occurrences.push(
      createOccurrence(
        id,
        monthDue,
        isUnpaid ? null : addDays(monthDue, extra.lateDays[month - 1] ?? 0),
      ),
    )
  }

  occurrences.push(createOccurrence(id, due, null))
}

let nextRecurringPaymentId = recurringPayments.length + 1

function latestDueDate(recurringPaymentId: number) {
  return occurrences
    .filter((item) => item.recurringPaymentId === recurringPaymentId)
    .map((item) => item.dueDate)
    .sort()
    .at(-1)
}

function firstDueDate(recurringPaymentId: number) {
  return occurrences
    .filter((item) => item.recurringPaymentId === recurringPaymentId)
    .map((item) => item.dueDate)
    .sort()
    .at(0)
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

function overdueDays(occurrence: IMockOccurrence) {
  return Math.max(
    0,
    daysBetween(occurrence.dueDate, occurrence.paymentDate ?? todayIso()),
  )
}

export function occurrenceStatus(occurrence: IMockOccurrence) {
  if (occurrence.isPaid) {
    return 'paid'
  }
  return overdueDays(occurrence) > 0 ? 'overdue' : 'unpaid'
}

function toDateTime(date: string) {
  return `${date}T00:00:00Z`
}

export function toOccurrenceDto(occurrence: IMockOccurrence) {
  const payment = findRecurringPayment(occurrence.recurringPaymentId)

  return {
    ...occurrence,
    dueDate: toDateTime(occurrence.dueDate),
    paymentDate: occurrence.paymentDate && toDateTime(occurrence.paymentDate),
    isOverdue: occurrenceStatus(occurrence) === 'overdue',
    overdueDays: overdueDays(occurrence),
    name: payment?.name ?? '',
    amount: payment?.amount ?? 0,
    currency: payment?.currency ?? 'RUB',
  }
}

export function toRecurringPaymentDto(payment: IMockRecurringPayment) {
  const { id, name, amount, currency, dayOfMonth, isActive } = payment

  return {
    id,
    name,
    amount,
    currency,
    billingDay: dayOfMonth,
    startDate: firstDueDate(id),
    isDeleted: !isActive,
  }
}

export function createRecurringPayment(input: INewRecurringPayment) {
  const payment: IMockRecurringPayment = {
    id: nextRecurringPaymentId++,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    period: 'monthly',
    dayOfMonth: dayOfMonth(input.startDate),
    isActive: true,
  }

  recurringPayments.push(payment)
  occurrences.push(createOccurrence(payment.id, input.startDate, null))
  ensureUpcomingOccurrences()

  return payment
}
