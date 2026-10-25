import { useState } from 'react'

export type TSortDirection = 'asc' | 'desc'

export interface ISortState<TKey extends string> {
  key: TKey
  direction: TSortDirection
}

type TSortValue = string | number

export type TSortGetters<TRow, TKey extends string> = Record<
  TKey,
  (row: TRow) => TSortValue
>

function compareValues(a: TSortValue, b: TSortValue): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return String(a).localeCompare(String(b), 'ru')
}

function getNextSort<TKey extends string>(
  sort: ISortState<TKey> | null,
  key: TKey,
): ISortState<TKey> | null {
  if (sort?.key !== key) {
    return { key, direction: 'asc' }
  }
  return sort.direction === 'asc' ? { key, direction: 'desc' } : null
}

export function useSort<TRow, TKey extends string>(
  rows: TRow[],
  getters: TSortGetters<TRow, TKey>,
) {
  const [sort, setSort] = useState<ISortState<TKey> | null>(null)

  function toggleSort(key: TKey) {
    setSort(getNextSort(sort, key))
  }

  if (!sort) {
    return { sortedRows: rows, sort, toggleSort }
  }

  const getValue = getters[sort.key]
  const order = sort.direction === 'asc' ? 1 : -1
  const sortedRows = [...rows].sort(
    (a, b) => compareValues(getValue(a), getValue(b)) * order,
  )

  return { sortedRows, sort, toggleSort }
}
