import type { KeyboardEvent, ReactNode } from 'react'

import { formatLongDate, type ICalendarDay } from '@/shared/lib'

import styles from './styles.module.css'

const SELECT_KEYS = ['Enter', ' ']

interface ICalendarDayProps {
  day: ICalendarDay
  isToday: boolean
  isSelected: boolean
  onSelect: (date: string) => void
  children: ReactNode
}

export function CalendarDay({
  day,
  isToday,
  isSelected,
  onSelect,
  children,
}: ICalendarDayProps) {
  function select() {
    onSelect(day.date)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (SELECT_KEYS.includes(event.key)) {
      event.preventDefault()
      select()
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={formatLongDate(day.date)}
      className={styles.cell}
      data-outside={!day.isCurrentMonth}
      data-selected={isSelected}
      onClick={select}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.dayNumber} data-today={isToday}>
        {day.day}
      </span>
      <div className={styles.items}>{children}</div>
    </div>
  )
}
