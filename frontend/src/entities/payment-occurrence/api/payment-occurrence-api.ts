import { baseApi } from '@/shared/api'

import type {
  IPaymentOccurrence,
  IPaymentOccurrencesFilter,
  IUpdatePaymentOccurrence,
  TOccurrenceStatus,
} from '../model/types'

interface IPaymentOccurrenceDto extends Omit<IPaymentOccurrence, 'status'> {
  isOverdue: boolean
}

function toDate(dateTime: string): string {
  return dateTime.slice(0, 10)
}

function toStatus(isPaid: boolean, isOverdue: boolean): TOccurrenceStatus {
  if (isPaid) {
    return 'paid'
  }
  return isOverdue ? 'overdue' : 'unpaid'
}

function toOccurrence({
  isOverdue,
  dueDate,
  paymentDate,
  ...occurrence
}: IPaymentOccurrenceDto): IPaymentOccurrence {
  return {
    ...occurrence,
    dueDate: toDate(dueDate),
    paymentDate: paymentDate && toDate(paymentDate),
    status: toStatus(occurrence.isPaid, isOverdue),
  }
}

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
      transformResponse: (occurrences: IPaymentOccurrenceDto[]) =>
        occurrences.map(toOccurrence),
      providesTags: ['PaymentOccurrence'],
    }),

    updatePaymentOccurrence: build.mutation<
      IPaymentOccurrence,
      IUpdatePaymentOccurrence
    >({
      query: ({ id, isPaid, paymentDate }) => ({
        url: `/payment-occurrences/${id}`,
        method: 'PATCH',
        body: { is_paid: isPaid, payment_date: paymentDate },
      }),
      transformResponse: toOccurrence,
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
