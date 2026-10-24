import { Group, SegmentedControl, Select } from '@mantine/core'

import type {
  IPaymentOccurrencesFilter,
  TOccurrenceStatusFilter,
} from '@/entities/payment-occurrence'
import { CURRENCIES, type TCurrency } from '@/shared/config'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
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
  function handleStatusChange(value: string) {
    onChange({
      ...filter,
      status: value === 'all' ? undefined : (value as TOccurrenceStatusFilter),
    })
  }

  function handleCurrencyChange(value: string | null) {
    onChange({ ...filter, currency: (value as TCurrency | null) ?? undefined })
  }

  return (
    <Group gap='md'>
      <SegmentedControl
        data={STATUS_OPTIONS}
        value={filter.status ?? 'all'}
        onChange={handleStatusChange}
        aria-label='Статус'
      />
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
