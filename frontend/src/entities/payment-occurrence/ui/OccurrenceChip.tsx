import { Text } from '@mantine/core'

import { getOccurrenceStatus } from '../lib/get-status'
import type { IPaymentOccurrence } from '../model/types'
import styles from './styles.module.css'

interface IOccurrenceChipProps {
  occurrence: IPaymentOccurrence
}

export function OccurrenceChip({ occurrence }: IOccurrenceChipProps) {
  const status = getOccurrenceStatus(occurrence.status)
  const color = status.color ?? 'var(--color-accent)'
  const label = `${occurrence.name}, ${status.label.toLowerCase()}`

  return (
    <div
      className={styles.chip}
      style={{ borderLeftColor: color }}
      title={label}
      aria-label={label}
    >
      <Text fz='xs' fw={600} truncate>
        {occurrence.name}
      </Text>
    </div>
  )
}
