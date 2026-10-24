import { Stack, Title } from '@mantine/core'

import { OccurrencesTable } from '@/widgets/occurrences-table'

export function OccurrencesPage() {
  return (
    <Stack gap='xl'>
      <Title order={1}>Периоды оплат</Title>
      <OccurrencesTable />
    </Stack>
  )
}
