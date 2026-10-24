import { useState } from 'react'

import {
  type IPaymentOccurrencesFilter,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'

export function useOccurrencesTable() {
  const [filter, setFilter] = useState<IPaymentOccurrencesFilter>({})
  const { data, isError, isLoading, isFetching, refetch } =
    useGetPaymentOccurrencesQuery(filter)

  return {
    filter,
    setFilter,
    resetFilter: () => setFilter({}),
    isFiltered: Boolean(filter.status ?? filter.currency),
    occurrences: data ?? [],
    isLoading,
    isError,
    isRefetching: isFetching && !isLoading,
    refetch,
  }
}
