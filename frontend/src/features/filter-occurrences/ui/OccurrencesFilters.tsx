import { Group, SegmentedControl, Select } from '@mantine/core'

import type {
  IPaymentOccurrencesFilter,
  TOccurrenceStatus,
} from '@/entities/payment-occurrence'
import { CURRENCIES, type TCurrency } from '@/shared/config'

import styles from './styles.module.css'

const ALL_STATUSES = 'all'

const STATUS_OPTIONS: {
  value: TOccurrenceStatus | typeof ALL_STATUSES
  label: string
}[] = [
  { value: ALL_STATUSES, label: 'Все' },
  { value: 'unpaid', label: 'Не оплачено' },
  { value: 'overdue', label: 'Просрочено' },
  { value: 'paid', label: 'Оплачено' },
]

interface IOccurrencesFiltersProps {
  filter: IPaymentOccurrencesFilter
  onChange: (filter: IPaymentOccurrencesFilter) => void
}

export function OccurrencesFilters({
  filter,
  onChange,
}: IOccurrencesFiltersProps) {
  function handleStatusChange(value: TOccurrenceStatus | typeof ALL_STATUSES) {
    onChange({ ...filter, status: value === ALL_STATUSES ? undefined : value })
  }

  function handleCurrencyChange(value: TCurrency | null) {
    onChange({ ...filter, currency: value ?? undefined })
  }

  return (
    <Group gap='md' maw='100%'>
      <div className={styles.statusScroll}>
        <SegmentedControl
          data={STATUS_OPTIONS}
          value={filter.status ?? ALL_STATUSES}
          onChange={handleStatusChange}
          aria-label='Статус'
        />
      </div>
      <Select
        data={[...CURRENCIES]}
        value={filter.currency ?? null}
        onChange={handleCurrencyChange}
        placeholder='Все валюты'
        aria-label='Валюта'
        clearable
        w={160}
      />
    </Group>
  )
}
