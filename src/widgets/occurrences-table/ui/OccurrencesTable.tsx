import { Button, LoadingOverlay, Stack, Text } from '@mantine/core'

import { Panel, QueryError, SkeletonRows } from '@/shared/ui'

import { useOccurrencesTable } from '../model/use-occurrences-table'
import { OccurrencesFilters } from './OccurrencesFilters'
import { OccurrencesTableView } from './OccurrencesTableView'

export function OccurrencesTable() {
  const {
    filter,
    setFilter,
    resetFilter,
    isFiltered,
    occurrences,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useOccurrencesTable()
  const isReady = !isLoading && !isError

  return (
    <Stack gap='md'>
      <OccurrencesFilters filter={filter} onChange={setFilter} />

      <Panel pos='relative' px='lg' py='sm'>
        <LoadingOverlay
          visible={isRefetching}
          overlayProps={{ radius: 'lg', backgroundOpacity: 0.5 }}
          loaderProps={{ size: 'sm' }}
        />

        {isLoading && <SkeletonRows />}

        {!isLoading && isError && (
          <QueryError
            message='Не удалось загрузить периоды оплат.'
            onRetry={refetch}
          />
        )}

        {isReady && occurrences.length === 0 && (
          <Stack gap='sm' align='flex-start' py='sm'>
            <Text c='dimmed'>
              {isFiltered
                ? 'Под выбранные фильтры периодов нет.'
                : 'Периодов оплат пока нет. Они появятся, когда администратор добавит регулярный платёж.'}
            </Text>
            {isFiltered && (
              <Button variant='secondary' onClick={resetFilter}>
                Сбросить фильтры
              </Button>
            )}
          </Stack>
        )}

        {isReady && occurrences.length > 0 && (
          <OccurrencesTableView occurrences={occurrences} />
        )}
      </Panel>
    </Stack>
  )
}
