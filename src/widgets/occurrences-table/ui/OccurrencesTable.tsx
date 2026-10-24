import {
  Button,
  LoadingOverlay,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'

import { todayIso } from '@/shared/lib'

import { useOccurrencesTable } from '../model/use-occurrences-table'
import { OccurrencesFilters } from './OccurrencesFilters'
import { OccurrencesTableView } from './OccurrencesTableView'

const SKELETON_ROWS = 6
const SKELETON_ROW_HEIGHT = 36

export function OccurrencesTable() {
  const {
    filter,
    setFilter,
    resetFilter,
    isFiltered,
    occurrences,
    isLoading,
    isRefetching,
  } = useOccurrencesTable()

  return (
    <Stack gap='md'>
      <OccurrencesFilters filter={filter} onChange={setFilter} />

      <Paper
        pos='relative'
        bg='var(--color-surface-2)'
        radius='lg'
        px='lg'
        py='sm'
      >
        <LoadingOverlay
          visible={isRefetching}
          overlayProps={{ radius: 'lg', backgroundOpacity: 0.5 }}
          loaderProps={{ size: 'sm' }}
        />

        {isLoading &&
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} h={SKELETON_ROW_HEIGHT} my='sm' />
          ))}

        {!isLoading && occurrences.length === 0 && (
          <Stack gap='sm' align='flex-start' py='sm'>
            <Text c='dimmed'>
              {isFiltered
                ? 'Под выбранные фильтры периодов нет.'
                : 'Периодов оплат пока нет. Они появятся, когда администратор добавит регулярный платёж.'}
            </Text>
            {isFiltered && (
              <Button variant='default' onClick={resetFilter}>
                Сбросить фильтры
              </Button>
            )}
          </Stack>
        )}

        {occurrences.length > 0 && (
          <OccurrencesTableView occurrences={occurrences} today={todayIso()} />
        )}
      </Paper>
    </Stack>
  )
}
