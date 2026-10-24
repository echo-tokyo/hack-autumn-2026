import { Table, Text } from '@mantine/core'

import {
  PERIOD_LABELS,
  useGetRecurringPaymentsQuery,
} from '@/entities/recurring-payment'
import { DeleteRecurringPaymentButton } from '@/features/delete-recurring-payment'
import { formatAmount, formatShortDate } from '@/shared/lib'
import { Panel, QueryError, ScrollTable, SkeletonRows } from '@/shared/ui'

const TABLE_MIN_WIDTH = 940

export function RecurringPaymentsTable() {
  const {
    data: payments = [],
    isLoading,
    isError,
    refetch,
  } = useGetRecurringPaymentsQuery()
  const isReady = !isLoading && !isError

  return (
    <Panel fill px='lg' py='sm'>
      {isLoading && <SkeletonRows />}

      {!isLoading && isError && (
        <QueryError
          message='Не удалось загрузить регулярные платежи.'
          onRetry={refetch}
        />
      )}

      {isReady && payments.length === 0 && (
        <Text c='dimmed' py='sm'>
          Регулярных платежей пока нет. Добавьте первый, например аренду или
          подписку.
        </Text>
      )}

      {isReady && payments.length > 0 && (
        <ScrollTable minWidth={TABLE_MIN_WIDTH}>
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
        </ScrollTable>
      )}
    </Panel>
  )
}
