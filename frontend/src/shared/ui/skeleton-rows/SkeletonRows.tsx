import { Skeleton } from '@mantine/core'

const DEFAULT_ROWS = 6
const DEFAULT_ROW_HEIGHT = 60

interface ISkeletonRowsProps {
  rows?: number
  rowHeight?: number
}

export function SkeletonRows({
  rows = DEFAULT_ROWS,
  rowHeight = DEFAULT_ROW_HEIGHT,
}: ISkeletonRowsProps) {
  return Array.from({ length: rows }, (_, index) => (
    <Skeleton key={index} h={rowHeight} my='sm' />
  ))
}
