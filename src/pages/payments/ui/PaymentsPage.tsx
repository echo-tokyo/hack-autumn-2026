import { Stack, Title } from '@mantine/core'

import { OccurrenceGroups } from '@/widgets/occurrence-groups'

export function PaymentsPage() {
  return (
    <Stack gap='xl'>
      <Title order={1}>Сводка</Title>
      <OccurrenceGroups />
    </Stack>
  )
}
