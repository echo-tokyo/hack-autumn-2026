import { Text } from '@mantine/core'
import type { ReactNode } from 'react'

import { formatMoney } from '@/shared/lib'

import { describeDue } from '../lib/describe-due'
import type { IPaymentOccurrence } from '../model/types'
import styles from './styles.module.css'

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
    <div className={styles.row}>
      <div className={styles.rowInfo}>
        <Text fw={600} truncate>
          {occurrence.name}
        </Text>
        <Text fz='sm' c={due.isOverdue ? 'var(--color-danger)' : 'dimmed'}>
          {due.text}
        </Text>
      </div>
      <div className={styles.rowActions}>
        <Text fw={700} className={styles.amount}>
          {formatMoney(occurrence.amount, occurrence.currency)}
        </Text>
        {action}
      </div>
    </div>
  )
}
