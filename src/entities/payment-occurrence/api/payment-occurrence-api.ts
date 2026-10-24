import { baseApi } from '@/shared/api'

import type {
  IPaymentOccurrence,
  IPaymentOccurrencesFilter,
  IUpdatePaymentOccurrence,
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

    updatePaymentOccurrence: build.mutation<
      IPaymentOccurrence,
      IUpdatePaymentOccurrence
    >({
      query: ({ id, ...body }) => ({
        url: `/payment-occurrences/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        'PaymentOccurrence',
        'PaymentsSummary',
        'RecurringPayment',
      ],
    }),
  }),
})

export const {
  useGetPaymentOccurrencesQuery,
  useUpdatePaymentOccurrenceMutation,
} = paymentOccurrenceApi
