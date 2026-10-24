import { Outlet } from 'react-router'

// Session check is added at the session step
export function ProtectedRoute() {
  return <Outlet />
}
