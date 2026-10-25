import { Stack } from '@mantine/core'

import { PageHeader } from '@/shared/ui'
import { PaymentOccurrences } from '@/widgets/occurrences'

export function OccurrencesPage() {
  return (
    <Stack gap='xl' flex={1} mih={0}>
      <PageHeader title='Периоды оплат' />
      <PaymentOccurrences />
    </Stack>
  )
}
