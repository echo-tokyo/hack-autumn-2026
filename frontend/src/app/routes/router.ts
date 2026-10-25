import { createBrowserRouter } from 'react-router'

import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { OccurrencesPage } from '@/pages/occurrences'
import { PaymentsPage } from '@/pages/payments'
import { RecurringPaymentsPage } from '@/pages/recurring-payments'
import { UsersPage } from '@/pages/users'
import { ROUTES } from '@/shared/config'

import { AdminRoute } from '../layouts/AdminRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AppLoader } from '../layouts/AppLoader'
import { MainLayout } from '../layouts/MainLayout'
import { ProtectedRoute } from '../layouts/ProtectedRoute'
import { RouteErrorBoundary } from '../layouts/RouteErrorBoundary'
import {
  occurrencesLoader,
  paymentsLoader,
  recurringPaymentsLoader,
  usersLoader,
} from './loaders'

export function createAppRouter() {
  return createBrowserRouter([
    {
      Component: AppLayout,
      HydrateFallback: AppLoader,
      ErrorBoundary: RouteErrorBoundary,
      children: [
        { path: ROUTES.login, Component: LoginPage },
        {
          Component: ProtectedRoute,
          children: [
            {
              Component: MainLayout,
              children: [
                {
                  path: ROUTES.payments,
                  loader: paymentsLoader,
                  Component: PaymentsPage,
                },
                {
                  path: ROUTES.occurrences,
                  loader: occurrencesLoader,
                  Component: OccurrencesPage,
                },
                {
                  Component: AdminRoute,
                  children: [
                    {
                      path: ROUTES.recurringPayments,
                      loader: recurringPaymentsLoader,
                      Component: RecurringPaymentsPage,
                    },
                    {
                      path: ROUTES.users,
                      loader: usersLoader,
                      Component: UsersPage,
                    },
                  ],
                },
                { path: '*', Component: NotFoundPage },
              ],
            },
          ],
        },
      ],
    },
  ])
}
