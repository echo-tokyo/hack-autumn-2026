import { daysBetween, formatShortDate } from '@/shared/lib'

import type { IPaymentOccurrence } from '../model/types'

export function describeDue(occurrence: IPaymentOccurrence, today: string) {
  if (occurrence.paymentDate) {
    const lateDays = daysBetween(occurrence.dueDate, occurrence.paymentDate)
    const paidText = `оплачено ${formatShortDate(occurrence.paymentDate)}`

    return {
      text:
        lateDays > 0 ? `${paidText}, с просрочкой ${lateDays} дн.` : paidText,
      isOverdue: false,
    }
  }

  const daysUntilDue = daysBetween(today, occurrence.dueDate)
  const dueText = `срок ${formatShortDate(occurrence.dueDate)}`

  if (daysUntilDue < 0) {
    return {
      text: `${dueText}, просрочено на ${-daysUntilDue} дн.`,
      isOverdue: true,
    }
  }

  return {
    text:
      daysUntilDue === 0
        ? `${dueText}, сегодня`
        : `${dueText}, через ${daysUntilDue} дн.`,
    isOverdue: false,
  }
}
