import { Button, Modal, SimpleGrid, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import type { IUser } from '@/entities/user'

import { useDeleteUser } from '../model/use-delete-user'

interface IDeleteUserButtonProps {
  user: IUser
}

export function DeleteUserButton({ user }: IDeleteUserButtonProps) {
  const [isOpened, { open, close }] = useDisclosure()
  const { remove, isLoading } = useDeleteUser(user)

  async function handleDelete() {
    if (await remove()) {
      close()
    }
  }

  return (
    <>
      <Button color='dark.5' c='var(--color-danger)' size='sm' onClick={open}>
        Удалить
      </Button>
      <Modal opened={isOpened} onClose={close} title='Удалить пользователя?'>
        <Stack gap='md'>
          <Text c='dimmed' fz='sm'>
            {user.username} больше не сможет войти в панель. Отметки оплат,
            которые он ставил, сохранятся.
          </Text>
          <SimpleGrid cols={2} spacing='xs' mt='xs'>
            <Button color='dark.5' disabled={isLoading} onClick={close}>
              Отмена
            </Button>
            <Button
              color='var(--color-danger)'
              loading={isLoading}
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </SimpleGrid>
        </Stack>
      </Modal>
    </>
  )
}
