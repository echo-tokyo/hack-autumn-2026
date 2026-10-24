import { useEffect } from 'react'
import { toast } from 'sonner'

import { useGetRecurringPaymentsQuery } from '@/entities/recurring-payment'
import { getErrorMessage } from '@/shared/api'

export function useRecurringPayments() {
  const { data, error, isLoading } = useGetRecurringPaymentsQuery()

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error))
    }
  }, [error])

  const payments = error ? [] : (data ?? [])

  return { payments, isLoading }
}
