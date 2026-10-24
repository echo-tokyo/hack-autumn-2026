import { formatShortDate } from '@/shared/lib'

import type { IPaymentOccurrence } from '../model/types'

const EMPTY_VALUE = '-'

export function formatPaymentDate(occurrence: IPaymentOccurrence): string {
  return occurrence.paymentDate
    ? formatShortDate(occurrence.paymentDate)
    : EMPTY_VALUE
}

export function formatOverdue(occurrence: IPaymentOccurrence): string {
  return occurrence.overdueDays > 0
    ? `${occurrence.overdueDays} дн.`
    : EMPTY_VALUE
}
