import { toast } from 'sonner'

import {
  type IRecurringPayment,
  useDeleteRecurringPaymentMutation,
} from '@/entities/recurring-payment'
import { getErrorMessage } from '@/shared/api'

const DELETE_ERROR_MESSAGES = {
  403: 'Удалять регулярные платежи может только администратор',
}

export function useDeleteRecurringPayment(payment: IRecurringPayment) {
  const [deleteMutation, { isLoading }] = useDeleteRecurringPaymentMutation()

  async function remove() {
    try {
      await deleteMutation(payment.id).unwrap()
      toast.success(`Платёж "${payment.name}" удалён`)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, DELETE_ERROR_MESSAGES))
      return false
    }
  }

  return { remove, isLoading }
}
