import { delay, http, HttpResponse } from 'msw'

import { todayIso } from '../dates'
import {
  ensureUpcomingOccurrences,
  isOverdueAt,
  isUnpaidAt,
  MOCK_CURRENCIES,
  occurrences,
  toOccurrenceDto,
} from '../db/payments'
import { BASE_URL, getSessionUser, unauthorized } from '../session'

export const paymentsSummaryHandlers = [
  http.get(`${BASE_URL}/payments/summary`, async ({ request, cookies }) => {
    await delay()
    if (!getSessionUser(cookies)) {
      return unauthorized()
    }

    ensureUpcomingOccurrences()
    const date = new URL(request.url).searchParams.get('date') ?? todayIso()
    const items = occurrences.map(toOccurrenceDto)

    const totals = MOCK_CURRENCIES.map((currency) => {
      const byCurrency = items.filter((item) => item.currency === currency)
      const sum = (predicate: (item: (typeof items)[number]) => boolean) =>
        byCurrency.filter(predicate).reduce((acc, item) => acc + item.amount, 0)

      return {
        currency,
        toPay: sum((item) => isUnpaidAt(item, date) && item.dueDate >= date),
        overdue: sum((item) => isOverdueAt(item, date)),
        paid: sum((item) => !isUnpaidAt(item, date)),
      }
    })

    return HttpResponse.json({ date, totals })
  }),
]
