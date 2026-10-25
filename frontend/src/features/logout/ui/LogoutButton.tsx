import { NavLink } from '@mantine/core'

import { useLogout } from '../model/use-logout'

export function LogoutButton() {
  const { logout, isLoading } = useLogout()

  return (
    <NavLink
      component='button'
      label='Выйти'
      disabled={isLoading}
      onClick={logout}
    />
  )
}
