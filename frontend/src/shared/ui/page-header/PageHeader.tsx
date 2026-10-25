import { Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

import styles from './styles.module.css'

interface IPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: IPageHeaderProps) {
  return (
    <header className={styles.header}>
      <Group justify='space-between' align='flex-end' gap='md'>
        <Stack gap='xs'>
          <Title order={1}>{title}</Title>
          {description && <Text c='dimmed'>{description}</Text>}
        </Stack>
        {action}
      </Group>
    </header>
  )
}
