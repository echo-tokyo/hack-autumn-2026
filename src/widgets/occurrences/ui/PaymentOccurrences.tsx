import {
  Button,
  Group,
  LoadingOverlay,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core'
import { useState } from 'react'

import {
  type IPaymentOccurrencesFilter,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'
import { OccurrencesFilters } from '@/features/filter-occurrences'
import { useShowSkeleton } from '@/shared/lib'
import { Panel, QueryError, SkeletonRows } from '@/shared/ui'

import {
  type TOccurrencesView,
  useOccurrencesView,
} from '../model/use-occurrences-view'
import { OccurrencesCalendarView } from './OccurrencesCalendarView'
import { OccurrencesTableView } from './OccurrencesTableView'

const VIEW_OPTIONS: { value: TOccurrencesView; label: string }[] = [
  { value: 'table', label: 'Таблица' },
  { value: 'calendar', label: 'Календарь' },
]

const EMPTY_MESSAGE =
  'Периодов оплат пока нет. Они появятся, когда администратор добавит регулярный платёж.'
const EMPTY_FILTERED_MESSAGE = 'Под выбранные фильтры периодов нет.'

type TContent = 'error' | 'loading' | 'empty' | TOccurrencesView

interface IContentParams {
  view: TOccurrencesView
  isError: boolean
  isLoading: boolean
  isEmpty: boolean
}

function getContent({
  view,
  isError,
  isLoading,
  isEmpty,
}: IContentParams): TContent {
  if (isError) {
    return 'error'
  }
  if (view === 'calendar') {
    return 'calendar'
  }
  if (isLoading) {
    return 'loading'
  }
  return isEmpty ? 'empty' : 'table'
}

interface IEmptyOccurrencesProps {
  isFiltered: boolean
  onReset: () => void
}

function EmptyOccurrences({ isFiltered, onReset }: IEmptyOccurrencesProps) {
  return (
    <Stack gap='sm' align='flex-start' py='sm'>
      <Text c='dimmed'>
        {isFiltered ? EMPTY_FILTERED_MESSAGE : EMPTY_MESSAGE}
      </Text>
      {isFiltered && (
        <Button variant='secondary' onClick={onReset}>
          Сбросить фильтры
        </Button>
      )}
    </Stack>
  )
}

export function PaymentOccurrences() {
  const [filter, setFilter] = useState<IPaymentOccurrencesFilter>({})
  const { view, setView } = useOccurrencesView()
  const {
    data: occurrences = [],
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetPaymentOccurrencesQuery(filter)

  const isFiltered = Boolean(filter.status ?? filter.currency)
  const content = getContent({
    view,
    isError,
    isLoading,
    isEmpty: occurrences.length === 0,
  })
  const isRefetching = isFetching && content !== 'loading'
  const showSkeleton = useShowSkeleton(content === 'loading')

  function resetFilter() {
    setFilter({})
  }

  return (
    <Stack gap='md' flex={1} mih={0}>
      <Group justify='space-between' gap='md'>
        <OccurrencesFilters filter={filter} onChange={setFilter} />
        <SegmentedControl
          data={VIEW_OPTIONS}
          value={view}
          onChange={setView}
          aria-label='Вид'
        />
      </Group>

      <Panel fill px='lg' py='sm'>
        <LoadingOverlay
          visible={isRefetching}
          overlayProps={{ radius: 'lg', backgroundOpacity: 0.5 }}
          loaderProps={{ size: 'sm' }}
        />

        {content === 'error' && (
          <QueryError
            message='Не удалось загрузить периоды оплат.'
            onRetry={refetch}
          />
        )}
        {showSkeleton && <SkeletonRows />}
        {content === 'empty' && (
          <EmptyOccurrences isFiltered={isFiltered} onReset={resetFilter} />
        )}
        {content === 'table' && (
          <OccurrencesTableView occurrences={occurrences} />
        )}
        {content === 'calendar' && (
          <OccurrencesCalendarView occurrences={occurrences} />
        )}
      </Panel>
    </Stack>
  )
}
