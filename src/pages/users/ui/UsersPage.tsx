import { Stack } from '@mantine/core'

import { CreateUserButton } from '@/features/create-user'
import { PageHeader } from '@/shared/ui'
import { UsersTable } from '@/widgets/users-table'

export function UsersPage() {
  return (
    <Stack gap='xl' flex={1} mih={0}>
      <PageHeader
        title='Пользователи'
        description='Администратор создаёт, меняет и удаляет обычных пользователей. Свою учётную запись он задаёт в .env.'
        action={<CreateUserButton />}
      />
      <UsersTable />
    </Stack>
  )
}
