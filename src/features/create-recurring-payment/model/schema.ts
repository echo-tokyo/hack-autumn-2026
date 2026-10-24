import { z } from 'zod'

import { CURRENCIES } from '@/shared/config'

export const recurringPaymentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Введите название')
    .max(255, 'Не больше 255 символов'),
  amount: z
    .number({ message: 'Укажите сумму' })
    .positive('Сумма должна быть больше нуля'),
  currency: z.enum(CURRENCIES),
  period: z.literal('monthly'),
  firstDueDate: z
    .string({ message: 'Укажите дату ближайшей оплаты' })
    .min(1, 'Укажите дату ближайшей оплаты'),
})

export type TRecurringPaymentSchema = z.infer<typeof recurringPaymentSchema>
