import { Stack } from '@mantine/core'

import { CreateRecurringPaymentButton } from '@/features/create-recurring-payment'
import { PageHeader } from '@/shared/ui'
import { RecurringPaymentsTable } from '@/widgets/recurring-payments-table'

export function RecurringPaymentsPage() {
  return (
    <Stack gap='xl' flex={1} mih={0}>
      <PageHeader
        title='Регулярные платежи'
        description='Удаление прекращает новые периоды и напоминания, история оплат сохраняется.'
        action={<CreateRecurringPaymentButton />}
      />
      <RecurringPaymentsTable />
    </Stack>
  )
}
