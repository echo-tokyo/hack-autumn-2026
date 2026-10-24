import { Group, Table, Text } from '@mantine/core'

import { isAdmin, USER_ROLE_LABELS } from '@/entities/user'
import { DeleteUserButton } from '@/features/delete-user'
import { EditUserButton } from '@/features/edit-user'
import { Panel, SkeletonRows } from '@/shared/ui'

import { useUsers } from '../model/use-users'

const TABLE_MIN_WIDTH = 520

export function UsersTable() {
  const { users, isLoading } = useUsers()

  return (
    <Panel px='lg' py='sm'>
      {isLoading && <SkeletonRows />}

      {users.length > 0 && (
        <Table.ScrollContainer minWidth={TABLE_MIN_WIDTH}>
          <Table verticalSpacing='sm' layout='fixed'>
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
                  <Table.Td>{USER_ROLE_LABELS[user.role]}</Table.Td>
                  <Table.Td>
                    {isAdmin(user) ? (
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
          </Table>
        </Table.ScrollContainer>
      )}
    </Panel>
  )
}
