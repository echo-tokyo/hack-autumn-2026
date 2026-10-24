import { NavLink } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'

import { useLogout } from '../model/use-logout'

export function LogoutButton() {
  const { logout, isLoading } = useLogout()

  return (
    <NavLink
      component='button'
      label='Выйти'
      rightSection={<IconLogout size={20} stroke={1.5} />}
      disabled={isLoading}
      onClick={logout}
    />
  )
}
