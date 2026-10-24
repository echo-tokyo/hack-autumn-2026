import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import type { IPaymentOccurrence } from '@/entities/payment-occurrence'

import { MarkPaymentForm } from './MarkPaymentForm'

interface IMarkPaymentButtonProps {
  occurrence: IPaymentOccurrence
}

export function MarkPaymentButton({ occurrence }: IMarkPaymentButtonProps) {
  const [isOpened, { open, close }] = useDisclosure()
  const label = occurrence.isPaid ? 'Изменить дату' : 'Отметить оплату'

  return (
    <>
      <Button color='dark.5' size='sm' onClick={open}>
        {label}
      </Button>
      <Modal opened={isOpened} onClose={close} title={label}>
        <MarkPaymentForm occurrence={occurrence} onDone={close} />
      </Modal>
    </>
  )
}
