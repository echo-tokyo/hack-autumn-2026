import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  type IPaymentOccurrencesFilter,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'
import { getErrorMessage } from '@/shared/api'

export function useOccurrencesTable() {
  const [filter, setFilter] = useState<IPaymentOccurrencesFilter>({})
  const { data, error, isLoading, isFetching } =
    useGetPaymentOccurrencesQuery(filter)

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error))
    }
  }, [error])

  const occurrences = error ? [] : (data ?? [])
  const isFiltered = Boolean(filter.status ?? filter.currency)

  return {
    filter,
    setFilter,
    resetFilter: () => setFilter({}),
    isFiltered,
    occurrences,
    isLoading,
    isRefetching: isFetching && !isLoading,
  }
}
