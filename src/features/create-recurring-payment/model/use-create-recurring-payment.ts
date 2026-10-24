import {
  type ICreateRecurringPayment,
  useCreateRecurringPaymentMutation,
} from '@/entities/recurring-payment'
import { runWithToast } from '@/shared/api'

const CREATE_ERROR_MESSAGES = {
  403: 'Добавлять регулярные платежи может только администратор',
}

export function useCreateRecurringPayment() {
  const [createMutation] = useCreateRecurringPaymentMutation()

  function create(values: ICreateRecurringPayment) {
    return runWithToast(() => createMutation(values).unwrap(), {
      successMessage: `Платёж "${values.name}" добавлен`,
      errorMessages: CREATE_ERROR_MESSAGES,
    })
  }

  return { create }
}
