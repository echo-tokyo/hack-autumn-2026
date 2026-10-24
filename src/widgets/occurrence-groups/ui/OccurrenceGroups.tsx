import { Button, Skeleton, Stack } from '@mantine/core'

import {
  OccurrenceRow,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'
import { todayIso } from '@/shared/lib'

import { groupOccurrences } from '../model/group-occurrences'
import { GroupMessage, OccurrenceGroup } from './OccurrenceGroup'

const SKELETON_ROWS = 4

export function OccurrenceGroups() {
  const { data, isLoading, isError, refetch } = useGetPaymentOccurrencesQuery()
  const today = todayIso()

  if (isLoading) {
    return (
      <OccurrenceGroup title='Платежи'>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} h={80} my='sm' />
        ))}
      </OccurrenceGroup>
    )
  }

  if (isError || !data) {
    return (
      <OccurrenceGroup title='Платежи'>
        <GroupMessage>Не удалось загрузить платежи.</GroupMessage>
        <Button variant='default' mb='sm' onClick={refetch}>
          Повторить
        </Button>
      </OccurrenceGroup>
    )
  }

  const groups = groupOccurrences(data, today)

  return (
    <Stack gap='xl'>
      {groups.map((group) => (
        <OccurrenceGroup
          key={group.key}
          title={group.title}
          count={group.items.length}
        >
          {group.items.length === 0 ? (
            <GroupMessage>{group.emptyText}</GroupMessage>
          ) : (
            group.items.map((item) => (
              <OccurrenceRow key={item.id} occurrence={item} today={today} />
            ))
          )}
        </OccurrenceGroup>
      ))}
    </Stack>
  )
}
