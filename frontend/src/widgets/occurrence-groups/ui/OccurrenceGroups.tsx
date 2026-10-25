import { Stack } from '@mantine/core'

import {
  OccurrenceRow,
  useGetPaymentOccurrencesQuery,
} from '@/entities/payment-occurrence'
import { MarkPaymentButton } from '@/features/mark-payment'
import { todayIso, useShowSkeleton } from '@/shared/lib'
import { QueryError, SkeletonRows } from '@/shared/ui'

import { groupOccurrences } from '../model/group-occurrences'
import { GroupMessage, OccurrenceGroup } from './OccurrenceGroup'

export function OccurrenceGroups() {
  const { data, isLoading, isError, refetch } = useGetPaymentOccurrencesQuery()
  const showSkeleton = useShowSkeleton(isLoading)
  const today = todayIso()

  if (isLoading) {
    return (
      showSkeleton && (
        <OccurrenceGroup title='Платежи'>
          <SkeletonRows rowHeight={56} />
        </OccurrenceGroup>
      )
    )
  }

  if (isError || !data) {
    return (
      <OccurrenceGroup title='Платежи'>
        <QueryError message='Не удалось загрузить платежи.' onRetry={refetch} />
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
              <OccurrenceRow
                key={item.id}
                occurrence={item}
                today={today}
                action={<MarkPaymentButton occurrence={item} />}
              />
            ))
          )}
        </OccurrenceGroup>
      ))}
    </Stack>
  )
}
