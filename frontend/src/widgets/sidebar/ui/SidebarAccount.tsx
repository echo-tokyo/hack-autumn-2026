import { Text } from '@mantine/core'

import { getUserRoleLabel, type IUser } from '@/entities/user'
import { Panel } from '@/shared/ui'

interface ISidebarAccountProps {
  user: IUser
}

export function SidebarAccount({ user }: ISidebarAccountProps) {
  return (
    <Panel p='md'>
      <Text fw={700} fz='lg'>
        @{user.username}
      </Text>
      <Text c='dimmed' fz='sm'>
        {getUserRoleLabel(user)}
      </Text>
    </Panel>
  )
}
