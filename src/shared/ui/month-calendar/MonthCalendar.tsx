import { ActionIcon, Button, Group, Text, Title } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { type ReactNode, useState } from 'react'

import { ICON_SIZE, ICON_STROKE } from '@/shared/config'
import {
  formatMonthTitle,
  getMonthDays,
  shiftMonth,
  todayIso,
  toMonthStart,
} from '@/shared/lib'

import { CalendarDay } from './CalendarDay'
import styles from './styles.module.css'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEK_MIN_HEIGHT = 104

interface IMonthCalendarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  renderDay: (date: string) => ReactNode
}

export function MonthCalendar({
  selectedDate,
  onSelectDate,
  renderDay,
}: IMonthCalendarProps) {
  const today = todayIso()
  const currentMonth = toMonthStart(today)
  const [month, setMonth] = useState(currentMonth)

  const days = getMonthDays(month)
  const weeksCount = days.length / WEEKDAYS.length
  const gridStyle = {
    gridTemplateRows: `auto repeat(${weeksCount}, minmax(${WEEK_MIN_HEIGHT}px, 1fr))`,
  }

  function showPreviousMonth() {
    setMonth(shiftMonth(month, -1))
  }

  function showNextMonth() {
    setMonth(shiftMonth(month, 1))
  }

  function showCurrentMonth() {
    setMonth(currentMonth)
  }

  return (
    <div className={styles.root}>
      <Group justify='space-between' py='xs' mb='sm'>
        <Group gap='xs'>
          <ActionIcon
            variant='secondary'
            size='input-md'
            aria-label='Предыдущий месяц'
            onClick={showPreviousMonth}
          >
            <IconChevronLeft size={ICON_SIZE} stroke={ICON_STROKE} />
          </ActionIcon>
          <ActionIcon
            variant='secondary'
            size='input-md'
            aria-label='Следующий месяц'
            onClick={showNextMonth}
          >
            <IconChevronRight size={ICON_SIZE} stroke={ICON_STROKE} />
          </ActionIcon>
          <Title order={2} ml='xs'>
            {formatMonthTitle(month)}
          </Title>
        </Group>
        <Button
          variant='secondary'
          disabled={month === currentMonth}
          onClick={showCurrentMonth}
        >
          Сегодня
        </Button>
      </Group>

      <div className={styles.scroll}>
        <div className={styles.grid} style={gridStyle}>
          {WEEKDAYS.map((weekday) => (
            <Text key={weekday} className={styles.weekday} fz='sm' c='dimmed'>
              {weekday}
            </Text>
          ))}

          {days.map((day) => (
            <CalendarDay
              key={day.date}
              day={day}
              isToday={day.date === today}
              isSelected={day.date === selectedDate}
              onSelect={onSelectDate}
            >
              {renderDay(day.date)}
            </CalendarDay>
          ))}
        </div>
      </div>
    </div>
  )
}
