import {
  type IRecurringPayment,
  useDeleteRecurringPaymentMutation,
} from '@/entities/recurring-payment'
import { runWithToast } from '@/shared/api'

const DELETE_ERROR_MESSAGES = {
  403: 'Удалять регулярные платежи может только администратор',
}

export function useDeleteRecurringPayment(payment: IRecurringPayment) {
  const [deleteMutation, { isLoading }] = useDeleteRecurringPaymentMutation()

  function remove() {
    return runWithToast(() => deleteMutation(payment.id).unwrap(), {
      successMessage: `Платёж "${payment.name}" удалён`,
      errorMessages: DELETE_ERROR_MESSAGES,
    })
  }

  return { remove, isLoading }
}
