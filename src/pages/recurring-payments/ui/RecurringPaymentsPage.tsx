import { Group, Stack, Text, Title } from '@mantine/core'

import { CreateRecurringPaymentButton } from '@/features/create-recurring-payment'
import { RecurringPaymentsTable } from '@/widgets/recurring-payments-table'

export function RecurringPaymentsPage() {
  return (
    <Stack gap='xl'>
      <Group justify='space-between' align='flex-end' gap='md'>
        <Stack gap='xs'>
          <Title order={1}>Регулярные платежи</Title>
          <Text c='dimmed'>
            Удаление прекращает новые периоды и напоминания, история оплат
            сохраняется.
          </Text>
        </Stack>
        <CreateRecurringPaymentButton />
      </Group>
      <RecurringPaymentsTable />
    </Stack>
  )
}
