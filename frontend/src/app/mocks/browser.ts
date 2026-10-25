import { setupWorker } from 'msw/browser'

import { authHandlers } from './handlers/auth'
import { paymentOccurrencesHandlers } from './handlers/payment-occurrences'
import { paymentsSummaryHandlers } from './handlers/payments-summary'
import { recurringPaymentsHandlers } from './handlers/recurring-payments'
import { usersHandlers } from './handlers/users'

export const worker = setupWorker(
  ...authHandlers,
  ...recurringPaymentsHandlers,
  ...paymentOccurrencesHandlers,
  ...paymentsSummaryHandlers,
  ...usersHandlers,
)
