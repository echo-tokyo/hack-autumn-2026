import {
  type IPaymentOccurrence,
  useUpdatePaymentOccurrenceMutation,
} from '@/entities/payment-occurrence'
import { runWithToast } from '@/shared/api'

export function useMarkPayment(occurrence: IPaymentOccurrence) {
  const [update, { isLoading }] = useUpdatePaymentOccurrenceMutation()

  function submit(paymentDate: string | null, successMessage: string) {
    return runWithToast(
      () =>
        update({
          id: occurrence.id,
          isPaid: paymentDate !== null,
          paymentDate,
        }).unwrap(),
      { successMessage },
    )
  }

  return {
    savePayment: (paymentDate: string) =>
      submit(
        paymentDate,
        occurrence.isPaid ? 'Дата оплаты изменена' : 'Оплата отмечена',
      ),
    cancelPayment: () => submit(null, 'Оплата отменена'),
    isLoading,
  }
}
