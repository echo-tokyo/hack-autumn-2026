import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { CreateUserForm } from './CreateUserForm'

export function CreateUserButton() {
  const [isOpened, { open, close }] = useDisclosure()

  return (
    <>
      <Button onClick={open}>Добавить пользователя</Button>
      <Modal opened={isOpened} onClose={close} title='Новый пользователь'>
        <CreateUserForm onDone={close} />
      </Modal>
    </>
  )
}
