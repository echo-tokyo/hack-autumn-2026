import { baseApi } from '@/shared/api'

import type {
  IPaymentOccurrence,
  IPaymentOccurrencesFilter,
} from '../model/types'

export const paymentOccurrenceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPaymentOccurrences: build.query<
      IPaymentOccurrence[],
      IPaymentOccurrencesFilter | void
    >({
      query: (filter) => ({
        url: '/payment-occurrences',
        params: filter ?? {},
      }),
      providesTags: ['PaymentOccurrence'],
    }),
  }),
})

export const { useGetPaymentOccurrencesQuery } = paymentOccurrenceApi
