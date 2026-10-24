import { Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

import { formatMoney, formatShortDate } from '@/shared/lib'

import { formatOverdue, formatPaymentDate } from '../lib/format-occurrence'
import { getOccurrenceStatus } from '../lib/get-status'
import type { IPaymentOccurrence } from '../model/types'

interface IDetailRowProps {
  label: string
  children: ReactNode
}

function DetailRow({ label, children }: IDetailRowProps) {
  return (
    <Group justify='space-between' gap='md' wrap='nowrap'>
      <Text fz='sm' c='dimmed'>
        {label}
      </Text>
      <Text fz='sm' ta='right'>
        {children}
      </Text>
    </Group>
  )
}

interface IOccurrenceDetailsProps {
  occurrence: IPaymentOccurrence
  action?: ReactNode
}

export function OccurrenceDetails({
  occurrence,
  action,
}: IOccurrenceDetailsProps) {
  const status = getOccurrenceStatus(occurrence.status)

  return (
    <Stack gap='md'>
      <Stack gap={4}>
        <Text fw={700}>{occurrence.name}</Text>
        <Text fw={700} fz='lg'>
          {formatMoney(occurrence.amount, occurrence.currency)}
        </Text>
      </Stack>

      <Stack gap='xs'>
        <DetailRow label='Срок оплаты'>
          {formatShortDate(occurrence.dueDate)}
        </DetailRow>
        <DetailRow label='Статус'>
          <Text span fz='sm' c={status.color}>
            {status.label}
          </Text>
        </DetailRow>
        <DetailRow label='Дата оплаты'>
          {formatPaymentDate(occurrence)}
        </DetailRow>
        <DetailRow label='Просрочка'>{formatOverdue(occurrence)}</DetailRow>
      </Stack>

      {action}
    </Stack>
  )
}
