import { Paper, type PaperProps } from '@mantine/core'
import type { ReactNode } from 'react'

interface IPanelProps extends PaperProps {
  children: ReactNode
}

export function Panel({ children, ...props }: IPanelProps) {
  return (
    <Paper bg='var(--color-surface-2)' radius='lg' {...props}>
      {children}
    </Paper>
  )
}
