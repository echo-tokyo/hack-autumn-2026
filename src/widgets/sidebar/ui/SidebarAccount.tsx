import { Paper, Text } from '@mantine/core'

import { type IUser, USER_ROLE_LABELS } from '@/entities/user'

interface ISidebarAccountProps {
  user: IUser
}

export function SidebarAccount({ user }: ISidebarAccountProps) {
  return (
    <Paper bg='var(--color-surface-2)' radius='lg' p='md'>
      <Text fw={700} fz='lg'>
        @{user.username}
      </Text>
      <Text c='dimmed' fz='sm'>
        {USER_ROLE_LABELS[user.role]}
      </Text>
    </Paper>
  )
}
