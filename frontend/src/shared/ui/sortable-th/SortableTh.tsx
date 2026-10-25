import { Table, type TableThProps, UnstyledButton } from '@mantine/core'
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { ICON_STROKE } from '@/shared/config'
import type { TSortDirection } from '@/shared/lib'

import styles from './styles.module.css'

const SORT_ICON_SIZE = 14

const ARIA_SORT = {
  asc: 'ascending',
  desc: 'descending',
} as const

interface ISortableThProps extends TableThProps {
  direction: TSortDirection | null
  onSort: () => void
  children: ReactNode
}

interface ISortIconProps {
  direction: TSortDirection | null
}

function SortIcon({ direction }: ISortIconProps) {
  if (direction === 'asc') {
    return <IconChevronUp size={SORT_ICON_SIZE} stroke={ICON_STROKE} />
  }
  if (direction === 'desc') {
    return <IconChevronDown size={SORT_ICON_SIZE} stroke={ICON_STROKE} />
  }
  return <IconSelector size={SORT_ICON_SIZE} stroke={ICON_STROKE} />
}

export function SortableTh({
  direction,
  onSort,
  children,
  ...props
}: ISortableThProps) {
  return (
    <Table.Th aria-sort={direction ? ARIA_SORT[direction] : 'none'} {...props}>
      <UnstyledButton
        className={styles.button}
        data-active={direction !== null}
        data-align={props.ta === 'right' ? 'right' : 'left'}
        onClick={onSort}
      >
        {children}
        <SortIcon direction={direction} />
      </UnstyledButton>
    </Table.Th>
  )
}
