import { Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

import { formatMoney } from '@/shared/lib'

import { describeDue } from '../lib/describe-due'
import type { IPaymentOccurrence } from '../model/types'

interface IOccurrenceRowProps {
  occurrence: IPaymentOccurrence
  today: string
  action?: ReactNode
}

export function OccurrenceRow({
  occurrence,
  today,
  action,
}: IOccurrenceRowProps) {
  const due = describeDue(occurrence, today)

  return (
    <Group justify='space-between' wrap='nowrap' gap='md' py='sm'>
      <Stack gap={2} miw={0}>
        <Text fw={600} truncate>
          {occurrence.name}
        </Text>
        <Text fz='sm' c={due.isOverdue ? 'var(--color-danger)' : 'dimmed'}>
          {due.text}
        </Text>
      </Stack>
      <Group gap='md' wrap='nowrap'>
        <Text fw={700} ta='right' style={{ whiteSpace: 'nowrap' }}>
          {formatMoney(occurrence.amount, occurrence.currency)}
        </Text>
        {action}
      </Group>
    </Group>
  )
}
