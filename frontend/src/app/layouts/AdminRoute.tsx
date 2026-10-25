import { Outlet } from 'react-router'

import { useCurrentUser } from '@/entities/user'
import { ForbiddenPage } from '@/pages/forbidden'

export function AdminRoute() {
  const user = useCurrentUser()

  return user.isAdmin ? <Outlet /> : <ForbiddenPage />
}
