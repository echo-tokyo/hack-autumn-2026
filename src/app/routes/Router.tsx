import { createBrowserRouter } from 'react-router'

import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { PaymentsPage } from '@/pages/payments'
import { ROUTES } from '@/shared/config'

import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from '../layouts/ProtectedRoute'

export const router = createBrowserRouter([
  {
    Component: AppLayout,
    children: [
      { path: ROUTES.login, Component: LoginPage },
      {
        Component: ProtectedRoute,
        children: [
          { path: ROUTES.payments, Component: PaymentsPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
])
