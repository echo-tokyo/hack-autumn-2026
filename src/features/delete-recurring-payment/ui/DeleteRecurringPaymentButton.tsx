import { Button, Modal, SimpleGrid, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import type { IRecurringPayment } from '@/entities/recurring-payment'

import { useDeleteRecurringPayment } from '../model/use-delete-recurring-payment'

interface IDeleteRecurringPaymentButtonProps {
  payment: IRecurringPayment
}

export function DeleteRecurringPaymentButton({
  payment,
}: IDeleteRecurringPaymentButtonProps) {
  const [isOpened, { open, close }] = useDisclosure()
  const { remove, isLoading } = useDeleteRecurringPayment(payment)

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
      <Modal opened={isOpened} onClose={close} title='Удалить платёж?'>
        <Stack gap='md'>
          <Text c='dimmed' fz='sm'>
            "{payment.name}" больше не будет создавать новые периоды и
            напоминания. Прошлые периоды и история оплат сохранятся.
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
              Удалить платёж
            </Button>
          </SimpleGrid>
        </Stack>
      </Modal>
    </>
  )
}
