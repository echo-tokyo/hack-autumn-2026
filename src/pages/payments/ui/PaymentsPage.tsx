import { Stack, Title } from '@mantine/core'

import { OccurrenceGroups } from '@/widgets/occurrence-groups'
import { PaymentsSummary } from '@/widgets/payments-summary'

export function PaymentsPage() {
  return (
    <Stack gap='xl'>
      <Title order={1}>Сводка</Title>
      <PaymentsSummary />
      <OccurrenceGroups />
    </Stack>
  )
}
