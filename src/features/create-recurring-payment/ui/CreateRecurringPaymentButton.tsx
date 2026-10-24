import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { CreateRecurringPaymentForm } from './CreateRecurringPaymentForm'

export function CreateRecurringPaymentButton() {
  const [isOpened, { open, close }] = useDisclosure()

  return (
    <>
      <Button onClick={open}>Добавить регулярный платёж</Button>
      <Modal
        opened={isOpened}
        onClose={close}
        title='Новый регулярный платёж'
        size='lg'
      >
        <CreateRecurringPaymentForm onDone={close} />
      </Modal>
    </>
  )
}
