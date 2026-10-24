import { baseApi } from '@/shared/api'

import type { IPaymentsSummary } from '../model/types'

export const paymentSummaryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPaymentsSummary: build.query<IPaymentsSummary, void>({
      query: () => '/payments/summary',
      providesTags: ['PaymentsSummary'],
    }),
  }),
})

export const { useGetPaymentsSummaryQuery } = paymentSummaryApi
