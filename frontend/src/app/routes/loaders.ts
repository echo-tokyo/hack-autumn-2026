import { paymentOccurrenceApi } from '@/entities/payment-occurrence'
import { paymentSummaryApi } from '@/entities/payment-summary'
import { recurringPaymentApi } from '@/entities/recurring-payment'
import { userApi } from '@/entities/user'

import { store } from '../model/store'

const PREFETCH_TIMEOUT = 300

interface IPrefetchRequest extends PromiseLike<unknown> {
  unsubscribe: () => void
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function prefetch(requests: IPrefetchRequest[]) {
  await Promise.race([Promise.allSettled(requests), wait(PREFETCH_TIMEOUT)])
  requests.forEach((request) => request.unsubscribe())
  return null
}

async function loadCurrentUser() {
  const request = store.dispatch(userApi.endpoints.getMe.initiate())
  const { data } = await request
  request.unsubscribe()
  return data
}

export async function paymentsLoader() {
  if (!(await loadCurrentUser())) {
    return null
  }

  return prefetch([
    store.dispatch(
      paymentOccurrenceApi.endpoints.getPaymentOccurrences.initiate(),
    ),
    store.dispatch(paymentSummaryApi.endpoints.getPaymentsSummary.initiate()),
  ])
}

export async function occurrencesLoader() {
  if (!(await loadCurrentUser())) {
    return null
  }

  return prefetch([
    store.dispatch(
      paymentOccurrenceApi.endpoints.getPaymentOccurrences.initiate({}),
    ),
  ])
}

export async function recurringPaymentsLoader() {
  const user = await loadCurrentUser()
  if (!user?.isAdmin) {
    return null
  }

  return prefetch([
    store.dispatch(
      recurringPaymentApi.endpoints.getRecurringPayments.initiate(),
    ),
  ])
}

export async function usersLoader() {
  const user = await loadCurrentUser()
  if (!user?.isAdmin) {
    return null
  }

  return prefetch([store.dispatch(userApi.endpoints.getUsers.initiate())])
}
