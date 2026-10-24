import {
  type IPaymentOccurrence,
  useUpdatePaymentOccurrenceMutation,
} from '@/entities/payment-occurrence'
import { runWithToast } from '@/shared/api'

export function useMarkPayment(occurrence: IPaymentOccurrence) {
  const [update, { isLoading }] = useUpdatePaymentOccurrenceMutation()

  function markPaid(paymentDate: string) {
    return runWithToast(
      () => update({ id: occurrence.id, isPaid: true, paymentDate }).unwrap(),
      {
        successMessage: occurrence.isPaid
          ? 'Дата оплаты изменена'
          : 'Оплата отмечена',
      },
    )
  }

  function cancel() {
    return runWithToast(
      () =>
        update({
          id: occurrence.id,
          isPaid: false,
          paymentDate: null,
        }).unwrap(),
      { successMessage: 'Оплата отменена' },
    )
  }

  return { markPaid, cancel, isLoading }
}
