import { Group, Text, Title } from '@mantine/core'
import { useState } from 'react'

import {
  groupByDueDate,
  type IPaymentOccurrence,
  OccurrenceChip,
  OccurrenceDetails,
} from '@/entities/payment-occurrence'
import { MarkPaymentButton } from '@/features/mark-payment'
import { formatLongDate, todayIso } from '@/shared/lib'
import { MonthCalendar } from '@/shared/ui'

import styles from './styles.module.css'

interface IOccurrencesCalendarViewProps {
  occurrences: IPaymentOccurrence[]
}

export function OccurrencesCalendarView({
  occurrences,
}: IOccurrencesCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(todayIso())

  const occurrencesByDate = groupByDueDate(occurrences)
  const selectedOccurrences = occurrencesByDate.get(selectedDate) ?? []

  function renderDay(date: string) {
    return occurrencesByDate
      .get(date)
      ?.map((occurrence) => (
        <OccurrenceChip key={occurrence.id} occurrence={occurrence} />
      ))
  }

  return (
    <div className={styles.layout}>
      <MonthCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        renderDay={renderDay}
      />

      <aside className={styles.aside}>
        <Group py='xs' mb='sm' className={styles.asideHeader}>
          <Title order={2}>{formatLongDate(selectedDate)}</Title>
        </Group>

        <div className={styles.asideContent}>
          {selectedOccurrences.length === 0 && (
            <Text c='dimmed' fz='sm'>
              В этот день платежей нет
            </Text>
          )}
          {selectedOccurrences.map((occurrence) => (
            <OccurrenceDetails
              key={occurrence.id}
              occurrence={occurrence}
              action={<MarkPaymentButton occurrence={occurrence} />}
            />
          ))}
        </div>
      </aside>
    </div>
  )
}
