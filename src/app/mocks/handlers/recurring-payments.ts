import { delay, http, HttpResponse } from 'msw'

import {
  createRecurringPayment,
  ensureUpcomingOccurrences,
  findRecurringPayment,
  type INewRecurringPayment,
  MOCK_CURRENCIES,
  recurringPayments,
  toRecurringPaymentDto,
} from '../db/payments'
import {
  badRequest,
  BASE_URL,
  forbidden,
  getSessionUser,
  notFound,
  unauthorized,
} from '../session'

function validate(body: INewRecurringPayment) {
  if (!body.name.trim()) {
    return 'Укажите название платежа'
  }
  if (!(body.amount > 0)) {
    return 'Сумма должна быть больше нуля'
  }
  if (!MOCK_CURRENCIES.includes(body.currency)) {
    return 'Валюта должна быть RUB, USD или EUR'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.firstDueDate)) {
    return 'Укажите дату ближайшей оплаты'
  }
  return null
}

export const recurringPaymentsHandlers = [
  http.get(`${BASE_URL}/recurring-payments`, async ({ cookies }) => {
    await delay()
    if (!getSessionUser(cookies)) {
      return unauthorized()
    }

    ensureUpcomingOccurrences()
    const items = recurringPayments
      .filter((item) => item.isActive)
      .map(toRecurringPaymentDto)

    return HttpResponse.json(items)
  }),

  http.post<never, INewRecurringPayment>(
    `${BASE_URL}/recurring-payments`,
    async ({ request, cookies }) => {
      await delay()
      const user = getSessionUser(cookies)
      if (!user) {
        return unauthorized()
      }
      if (user.role !== 'admin') {
        return forbidden()
      }

      const body = await request.json()
      const error = validate(body)
      if (error) {
        return badRequest(error)
      }

      const payment = createRecurringPayment(body)

      return HttpResponse.json(toRecurringPaymentDto(payment), { status: 201 })
    },
  ),

  http.delete(
    `${BASE_URL}/recurring-payments/:id`,
    async ({ params, cookies }) => {
      await delay()
      const user = getSessionUser(cookies)
      if (!user) {
        return unauthorized()
      }
      if (user.role !== 'admin') {
        return forbidden()
      }

      const payment = findRecurringPayment(Number(params.id))
      if (!payment?.isActive) {
        return notFound('Регулярный платёж не найден')
      }

      payment.isActive = false

      return new HttpResponse(null, { status: 204 })
    },
  ),
]
