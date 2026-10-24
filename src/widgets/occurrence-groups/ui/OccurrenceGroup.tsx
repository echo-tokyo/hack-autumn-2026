import { Paper, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

import styles from './styles.module.css'

interface IOccurrenceGroupProps {
  title: string
  count?: number
  children: ReactNode
}

export function OccurrenceGroup({
  title,
  count,
  children,
}: IOccurrenceGroupProps) {
  return (
    <Stack component='section' gap='sm'>
      <Title order={2}>
        {title}
        {count !== undefined && ` (${count})`}
      </Title>
      <Paper bg='var(--color-surface-2)' radius='lg' px='lg' py='xs'>
        <div className={styles.list}>{children}</div>
      </Paper>
    </Stack>
  )
}

interface IGroupMessageProps {
  children: ReactNode
}

export function GroupMessage({ children }: IGroupMessageProps) {
  return (
    <Text c='dimmed' py='sm'>
      {children}
    </Text>
  )
}
