import { Outlet } from 'react-router'

import { isAdmin, useCurrentUser } from '@/entities/user'
import { ForbiddenPage } from '@/pages/forbidden'

export function AdminRoute() {
  const user = useCurrentUser()

  return isAdmin(user) ? <Outlet /> : <ForbiddenPage />
}
