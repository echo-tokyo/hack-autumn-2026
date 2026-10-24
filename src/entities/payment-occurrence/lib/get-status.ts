import { daysBetween } from '@/shared/lib'

import type { IPaymentOccurrence } from '../model/types'

export function getOccurrenceStatus(
  occurrence: IPaymentOccurrence,
  today: string,
) {
  const overdueDays = Math.max(
    0,
    daysBetween(occurrence.dueDate, occurrence.paymentDate ?? today),
  )

  if (occurrence.isPaid) {
    return { label: 'Оплачено', color: 'var(--color-success)', overdueDays }
  }

  if (overdueDays > 0) {
    return { label: 'Просрочено', color: 'var(--color-danger)', overdueDays }
  }

  return { label: 'Ожидает оплаты', color: undefined, overdueDays }
}
