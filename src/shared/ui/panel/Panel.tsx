import { Paper, type PaperProps } from '@mantine/core'
import type { ReactNode } from 'react'

import styles from './styles.module.css'

interface IPanelProps extends PaperProps {
  fill?: boolean
  children: ReactNode
}

export function Panel({ fill = false, children, ...props }: IPanelProps) {
  return (
    <Paper
      bg='var(--color-surface-2)'
      radius='lg'
      className={fill ? styles.fill : undefined}
      {...props}
    >
      {children}
    </Paper>
  )
}
