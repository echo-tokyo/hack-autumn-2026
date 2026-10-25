import { Box, Stack } from '@mantine/core'

import { useCurrentUser } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { Logo } from '@/shared/ui'

import { NAV_GROUPS } from '../config/nav-groups'
import { SidebarAccount } from './SidebarAccount'
import { SidebarNav } from './SidebarNav'

interface ISidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: ISidebarProps) {
  const user = useCurrentUser()
  const groups = NAV_GROUPS.filter((group) => !group.adminOnly || user.isAdmin)

  return (
    <Stack mih='100%' justify='space-between' gap='xl'>
      <Stack gap='xl'>
        <SidebarAccount user={user} />
        <SidebarNav groups={groups} onNavigate={onNavigate} />
      </Stack>

      <Stack gap='lg'>
        <LogoutButton />
        <Box px='sm' visibleFrom='sm'>
          <Logo />
        </Box>
      </Stack>
    </Stack>
  )
}
