import { Stack } from '@mantine/core'

import { PageHeader } from '@/shared/ui'
import { OccurrenceGroups } from '@/widgets/occurrence-groups'
import { PaymentsSummary } from '@/widgets/payments-summary'

export function PaymentsPage() {
  return (
    <Stack gap='xl'>
      <PageHeader title='Сводка' />
      <PaymentsSummary />
      <OccurrenceGroups />
    </Stack>
  )
}
