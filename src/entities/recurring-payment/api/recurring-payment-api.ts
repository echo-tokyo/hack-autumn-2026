import { baseApi } from '@/shared/api'

import type { ICreateRecurringPayment, IRecurringPayment } from '../model/types'

const AFFECTED_TAGS = [
  'RecurringPayment',
  'PaymentOccurrence',
  'PaymentsSummary',
] as const

export const recurringPaymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecurringPayments: build.query<IRecurringPayment[], void>({
      query: () => '/recurring-payments',
      providesTags: ['RecurringPayment'],
    }),

    createRecurringPayment: build.mutation<
      IRecurringPayment,
      ICreateRecurringPayment
    >({
      query: (body) => ({ url: '/recurring-payments', method: 'POST', body }),
      invalidatesTags: [...AFFECTED_TAGS],
    }),

    deleteRecurringPayment: build.mutation<void, number>({
      query: (id) => ({ url: `/recurring-payments/${id}`, method: 'DELETE' }),
      invalidatesTags: [...AFFECTED_TAGS],
    }),
  }),
})

export const {
  useGetRecurringPaymentsQuery,
  useCreateRecurringPaymentMutation,
  useDeleteRecurringPaymentMutation,
} = recurringPaymentApi
