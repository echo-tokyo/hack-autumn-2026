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
import { MainLayout } from '../layouts/MainLayout'
import { ProtectedRoute } from '../layouts/ProtectedRoute'
import { RouteErrorBoundary } from '../layouts/RouteErrorBoundary'

export const router = createBrowserRouter([
  {
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { path: ROUTES.login, Component: LoginPage },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: MainLayout,
            children: [
              { path: ROUTES.payments, Component: PaymentsPage },
              { path: ROUTES.occurrences, Component: OccurrencesPage },
              {
                Component: AdminRoute,
                children: [
                  {
                    path: ROUTES.recurringPayments,
                    Component: RecurringPaymentsPage,
                  },
                  { path: ROUTES.users, Component: UsersPage },
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
