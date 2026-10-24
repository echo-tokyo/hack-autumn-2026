import { useState } from 'react'

import {
  type IPaymentOccurrencesFilter,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'
import { useErrorToast } from '@/shared/api'

export function useOccurrencesTable() {
  const [filter, setFilter] = useState<IPaymentOccurrencesFilter>({})
  const { data, error, isLoading, isFetching } =
    useGetPaymentOccurrencesQuery(filter)

  useErrorToast(error)

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
