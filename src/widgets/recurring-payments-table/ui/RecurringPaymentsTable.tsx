import { Table, Text } from '@mantine/core'

import { PERIOD_LABELS } from '@/entities/recurring-payment'
import { DeleteRecurringPaymentButton } from '@/features/delete-recurring-payment'
import { formatAmount, formatShortDate } from '@/shared/lib'
import { Panel, SkeletonRows } from '@/shared/ui'

import { useRecurringPayments } from '../model/use-recurring-payments'

const TABLE_MIN_WIDTH = 720

export function RecurringPaymentsTable() {
  const { payments, isLoading } = useRecurringPayments()

  return (
    <Panel px='lg' py='sm'>
      {isLoading && <SkeletonRows />}

      {!isLoading && payments.length === 0 && (
        <Text c='dimmed' py='sm'>
          Регулярных платежей пока нет. Добавьте первый, например аренду или
          подписку.
        </Text>
      )}

      {payments.length > 0 && (
        <Table.ScrollContainer minWidth={TABLE_MIN_WIDTH}>
          <Table verticalSpacing='sm' layout='fixed'>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th ta='right' w={140}>
                  Сумма
                </Table.Th>
                <Table.Th w={100}>Валюта</Table.Th>
                <Table.Th w={160}>Периодичность</Table.Th>
                <Table.Th w={180}>Ближайшая оплата</Table.Th>
                <Table.Th w={130}>Действие</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payments.map((payment) => (
                <Table.Tr key={payment.id}>
                  <Table.Td fw={600}>{payment.name}</Table.Td>
                  <Table.Td ta='right'>{formatAmount(payment.amount)}</Table.Td>
                  <Table.Td>{payment.currency}</Table.Td>
                  <Table.Td>{PERIOD_LABELS[payment.period]}</Table.Td>
                  <Table.Td>
                    {payment.nextDueDate
                      ? formatShortDate(payment.nextDueDate)
                      : '-'}
                  </Table.Td>
                  <Table.Td>
                    <DeleteRecurringPaymentButton payment={payment} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Panel>
  )
}
