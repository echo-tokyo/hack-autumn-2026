import { toast } from 'sonner'

import {
  type ICreateRecurringPayment,
  useCreateRecurringPaymentMutation,
} from '@/entities/recurring-payment'
import { getErrorMessage } from '@/shared/api'

const CREATE_ERROR_MESSAGES = {
  403: 'Добавлять регулярные платежи может только администратор',
}

export function useCreateRecurringPayment() {
  const [createMutation] = useCreateRecurringPaymentMutation()

  async function create(values: ICreateRecurringPayment) {
    try {
      await createMutation(values).unwrap()
      toast.success(`Платёж "${values.name}" добавлен`)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, CREATE_ERROR_MESSAGES))
      return false
    }
  }

  return { create }
}
