import type { IPaymentOccurrence } from '@/entities/payment-occurrence'
import { daysBetween } from '@/shared/lib'

const SOON_DAYS = 14
const RECENTLY_PAID_DAYS = 30

export type TOccurrenceGroupKey = 'overdue' | 'soon' | 'later' | 'recentlyPaid'

export interface IOccurrenceGroup {
  key: TOccurrenceGroupKey
  title: string
  emptyText: string
  items: IPaymentOccurrence[]
}

export function groupOccurrences(
  occurrences: IPaymentOccurrence[],
  today: string,
): IOccurrenceGroup[] {
  const daysUntilDue = (item: IPaymentOccurrence) =>
    daysBetween(today, item.dueDate)

  const unpaid = occurrences
    .filter((item) => !item.isPaid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const recentlyPaid = occurrences
    .filter(
      (item) =>
        item.paymentDate !== null &&
        daysBetween(item.paymentDate, today) <= RECENTLY_PAID_DAYS,
    )
    .sort((a, b) => (b.paymentDate ?? '').localeCompare(a.paymentDate ?? ''))

  return [
    {
      key: 'overdue',
      title: 'Просрочено',
      emptyText: 'Просроченных платежей нет',
      items: unpaid.filter((item) => daysUntilDue(item) < 0),
    },
    {
      key: 'soon',
      title: `Ближайшие ${SOON_DAYS} дней`,
      emptyText: 'Ближайших платежей нет',
      items: unpaid.filter(
        (item) => daysUntilDue(item) >= 0 && daysUntilDue(item) <= SOON_DAYS,
      ),
    },
    {
      key: 'later',
      title: 'Позже',
      emptyText: 'Дальше платежей нет',
      items: unpaid.filter((item) => daysUntilDue(item) > SOON_DAYS),
    },
    {
      key: 'recentlyPaid',
      title: 'Оплачено недавно',
      emptyText: 'За последний месяц оплат не было',
      items: recentlyPaid,
    },
  ]
}
