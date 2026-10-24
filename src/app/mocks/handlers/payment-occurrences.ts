import { delay, http, HttpResponse } from 'msw'

import {
  ensureUpcomingOccurrences,
  occurrences,
  toOccurrenceDto,
} from '../db/payments'
import {
  badRequest,
  BASE_URL,
  getSessionUser,
  notFound,
  unauthorized,
} from '../session'

interface IUpdateOccurrenceBody {
  isPaid: boolean
  paymentDate?: string | null
}

function findOccurrence(id: string | readonly string[] | undefined) {
  return occurrences.find((item) => String(item.id) === id)
}

export const paymentOccurrencesHandlers = [
  http.get(`${BASE_URL}/payment-occurrences`, async ({ request, cookies }) => {
    await delay()
    if (!getSessionUser(cookies)) {
      return unauthorized()
    }

    ensureUpcomingOccurrences()
    const params = new URL(request.url).searchParams
    const status = params.get('status')
    const currency = params.get('currency')

    const items = occurrences
      .map(toOccurrenceDto)
      .filter((item) => !status || item.status === status)
      .filter((item) => !currency || item.currency === currency)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))

    return HttpResponse.json(items)
  }),

  http.get(
    `${BASE_URL}/payment-occurrences/:id`,
    async ({ params, cookies }) => {
      await delay()
      if (!getSessionUser(cookies)) {
        return unauthorized()
      }

      const occurrence = findOccurrence(params.id)

      return occurrence
        ? HttpResponse.json(toOccurrenceDto(occurrence))
        : notFound('Период оплаты не найден')
    },
  ),

  http.patch<{ id: string }, IUpdateOccurrenceBody>(
    `${BASE_URL}/payment-occurrences/:id`,
    async ({ params, request, cookies }) => {
      await delay()
      if (!getSessionUser(cookies)) {
        return unauthorized()
      }

      const occurrence = findOccurrence(params.id)
      if (!occurrence) {
        return notFound('Период оплаты не найден')
      }

      const { isPaid, paymentDate } = await request.json()
      if (isPaid && !paymentDate) {
        return badRequest('Укажите фактическую дату оплаты')
      }

      occurrence.isPaid = isPaid
      occurrence.paymentDate = isPaid ? (paymentDate ?? null) : null

      return HttpResponse.json(toOccurrenceDto(occurrence))
    },
  ),
]
