import { toast } from 'sonner'

import {
  type IPaymentOccurrence,
  useUpdatePaymentOccurrenceMutation,
} from '@/entities/payment-occurrence'
import { getErrorMessage } from '@/shared/api'

export function useMarkPayment(occurrence: IPaymentOccurrence) {
  const [update, { isLoading }] = useUpdatePaymentOccurrenceMutation()

  async function submit(paymentDate: string | null, successMessage: string) {
    try {
      await update({
        id: occurrence.id,
        isPaid: paymentDate !== null,
        paymentDate,
      }).unwrap()
      toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
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
