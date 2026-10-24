import { Button, SimpleGrid, Stack, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useState } from 'react'

import type { IPaymentOccurrence } from '@/entities/payment-occurrence'
import { formatMoney, formatShortDate, todayIso } from '@/shared/lib'

import { useMarkPayment } from '../model/use-mark-payment'

interface IMarkPaymentFormProps {
  occurrence: IPaymentOccurrence
  onDone: () => void
}

export function MarkPaymentForm({ occurrence, onDone }: IMarkPaymentFormProps) {
  const today = todayIso()
  const [paymentDate, setPaymentDate] = useState<string | null>(
    occurrence.paymentDate ?? today,
  )
  const { markPaid, cancel, isLoading } = useMarkPayment(occurrence)
  const isUnchanged = paymentDate === occurrence.paymentDate

  async function handleSave() {
    if (paymentDate && (await markPaid(paymentDate))) {
      onDone()
    }
  }

  async function handleCancel() {
    if (await cancel()) {
      onDone()
    }
  }

  return (
    <Stack gap='md'>
      <Text c='dimmed' fz='sm'>
        {occurrence.name}, {formatMoney(occurrence.amount, occurrence.currency)}
        , срок {formatShortDate(occurrence.dueDate)}
      </Text>

      <DatePickerInput
        label='Фактическая дата оплаты'
        withAsterisk
        value={paymentDate}
        onChange={setPaymentDate}
        maxDate={today}
        valueFormat='DD.MM.YYYY'
      />

      <SimpleGrid cols={occurrence.isPaid ? 2 : 1} spacing='xs' mt='xs'>
        {occurrence.isPaid && (
          <Button
            variant='secondary-danger'
            disabled={isLoading}
            onClick={handleCancel}
          >
            Отменить оплату
          </Button>
        )}
        <Button
          disabled={!paymentDate || isUnchanged}
          loading={isLoading}
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </SimpleGrid>
    </Stack>
  )
}
