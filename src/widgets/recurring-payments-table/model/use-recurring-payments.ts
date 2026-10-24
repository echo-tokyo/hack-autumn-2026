import { useGetRecurringPaymentsQuery } from '@/entities/recurring-payment'
import { useErrorToast } from '@/shared/api'

export function useRecurringPayments() {
  const { data, error, isLoading } = useGetRecurringPaymentsQuery()

  useErrorToast(error)

  const payments = error ? [] : (data ?? [])

  return { payments, isLoading }
}
