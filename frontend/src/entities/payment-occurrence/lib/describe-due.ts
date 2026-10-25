import { daysBetween, formatShortDate } from '@/shared/lib'

import type { IPaymentOccurrence } from '../model/types'

export function describeDue(occurrence: IPaymentOccurrence, today: string) {
  const dueText = `срок ${formatShortDate(occurrence.dueDate)}`

  if (occurrence.paymentDate) {
    const paidText = `оплачено ${formatShortDate(occurrence.paymentDate)}`

    return {
      text:
        occurrence.overdueDays > 0
          ? `${paidText}, с просрочкой ${occurrence.overdueDays} дн.`
          : paidText,
      isOverdue: false,
    }
  }

  if (occurrence.status === 'overdue') {
    return {
      text: `${dueText}, просрочено на ${occurrence.overdueDays} дн.`,
      isOverdue: true,
    }
  }

  const daysUntilDue = daysBetween(today, occurrence.dueDate)

  return {
    text:
      daysUntilDue <= 0
        ? `${dueText}, сегодня`
        : `${dueText}, через ${daysUntilDue} дн.`,
    isOverdue: false,
  }
}
