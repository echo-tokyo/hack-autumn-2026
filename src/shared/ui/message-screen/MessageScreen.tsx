import { Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

const TEXT_MAX_WIDTH = 520

interface IMessageScreenProps {
  title: string
  description: string
  action: ReactNode
}

export function MessageScreen({
  title,
  description,
  action,
}: IMessageScreenProps) {
  return (
    <Stack gap='md' align='flex-start' maw={TEXT_MAX_WIDTH}>
      <Title order={1}>{title}</Title>
      <Text c='dimmed'>{description}</Text>
      {action}
    </Stack>
  )
}
