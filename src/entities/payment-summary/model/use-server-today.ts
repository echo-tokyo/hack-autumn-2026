import { todayIso } from '@/shared/lib'

import { useGetPaymentsSummaryQuery } from '../api/payment-summary-api'

export function useServerToday() {
  const { data } = useGetPaymentsSummaryQuery()

  return data?.date ?? todayIso()
}
