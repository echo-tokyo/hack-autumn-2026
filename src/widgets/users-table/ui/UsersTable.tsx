import { Group, Table, Text } from '@mantine/core'

import { getUserRoleLabel, useGetUsersQuery } from '@/entities/user'
import { DeleteUserButton } from '@/features/delete-user'
import { EditUserButton } from '@/features/edit-user'
import { useShowSkeleton } from '@/shared/lib'
import { Panel, QueryError, ScrollTable, SkeletonRows } from '@/shared/ui'

const TABLE_MIN_WIDTH = 600

export function UsersTable() {
  const { data: users = [], isLoading, isError, refetch } = useGetUsersQuery()
  const showSkeleton = useShowSkeleton(isLoading)

  return (
    <Panel fill px='lg' py='sm'>
      {showSkeleton && <SkeletonRows />}

      {!isLoading && isError && (
        <QueryError
          message='Не удалось загрузить пользователей.'
          onRetry={refetch}
        />
      )}

      {!isError && users.length > 0 && (
        <ScrollTable minWidth={TABLE_MIN_WIDTH}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Логин</Table.Th>
              <Table.Th w={160}>Роль</Table.Th>
              <Table.Th w={240}>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td fw={600}>{user.username}</Table.Td>
                <Table.Td>{getUserRoleLabel(user)}</Table.Td>
                <Table.Td>
                  {user.isAdmin ? (
                    <Text c='dimmed' fz='sm'>
                      Задан в .env, не редактируется
                    </Text>
                  ) : (
                    <Group gap='xs' wrap='nowrap'>
                      <EditUserButton user={user} />
                      <DeleteUserButton user={user} />
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </ScrollTable>
      )}
    </Panel>
  )
}
