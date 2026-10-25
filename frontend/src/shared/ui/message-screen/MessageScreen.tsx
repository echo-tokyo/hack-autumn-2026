import { SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

import { BrandPattern } from '../brand-pattern/BrandPattern'
import styles from './styles.module.css'

const SCREEN_MAX_WIDTH = 960

interface IMessageScreenProps {
  title: string
  description: string
  action: ReactNode
  withPattern?: boolean
}

export function MessageScreen({
  title,
  description,
  action,
  withPattern = true,
}: IMessageScreenProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, md: withPattern ? 2 : 1 }}
      spacing='xl'
      maw={SCREEN_MAX_WIDTH}
      w='100%'
    >
      <Stack gap='md' align='flex-start' justify='center'>
        <Title order={1}>{title}</Title>
        <Text c='dimmed'>{description}</Text>
        {action}
      </Stack>
      {withPattern && (
        <div className={styles.art}>
          <BrandPattern />
        </div>
      )}
    </SimpleGrid>
  )
}
