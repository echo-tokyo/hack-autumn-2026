import { Navigate, Outlet, useLocation } from 'react-router'

import { useGetMeQuery } from '@/entities/user'
import { ROUTES } from '@/shared/config'

export function ProtectedRoute() {
  const { data: user, isLoading } = useGetMeQuery()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!user) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
