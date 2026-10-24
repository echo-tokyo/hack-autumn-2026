import { Group, Stack, Text, Title } from '@mantine/core'

import { CreateUserButton } from '@/features/create-user'
import { UsersTable } from '@/widgets/users-table'

export function UsersPage() {
  return (
    <Stack gap='xl'>
      <Group justify='space-between' align='flex-end' gap='md'>
        <Stack gap='xs'>
          <Title order={1}>Пользователи</Title>
          <Text c='dimmed'>
            Администратор создаёт, меняет и удаляет обычных пользователей. Свою
            учётную запись он задаёт в .env.
          </Text>
        </Stack>
        <CreateUserButton />
      </Group>
      <UsersTable />
    </Stack>
  )
}
