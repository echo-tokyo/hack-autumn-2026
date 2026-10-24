import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import type { IUser } from '@/entities/user'

import { EditUserForm } from './EditUserForm'

interface IEditUserButtonProps {
  user: IUser
}

export function EditUserButton({ user }: IEditUserButtonProps) {
  const [isOpened, { open, close }] = useDisclosure()

  return (
    <>
      <Button color='dark.5' size='sm' onClick={open}>
        Изменить
      </Button>
      <Modal
        opened={isOpened}
        onClose={close}
        title={`Пользователь ${user.username}`}
      >
        <EditUserForm user={user} onDone={close} />
      </Modal>
    </>
  )
}
