import { Table } from '@mantine/core'
import type { ReactNode } from 'react'

import styles from './styles.module.css'

interface IScrollTableProps {
  minWidth: number
  children: ReactNode
}

export function ScrollTable({ minWidth, children }: IScrollTableProps) {
  return (
    <div className={styles.scroll}>
      <Table verticalSpacing='sm' layout='fixed' miw={minWidth} stickyHeader>
        {children}
      </Table>
    </div>
  )
}
