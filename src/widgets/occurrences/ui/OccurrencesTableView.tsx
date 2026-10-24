import { Table, Text } from '@mantine/core'

import {
  formatOverdue,
  formatPaymentDate,
  getOccurrenceStatus,
  type IPaymentOccurrence,
} from '@/entities/payment-occurrence'
import { MarkPaymentButton } from '@/features/mark-payment'
import { formatAmount, formatShortDate } from '@/shared/lib'
import { ScrollTable } from '@/shared/ui'

const TABLE_MIN_WIDTH = 1140

interface IOccurrencesTableViewProps {
  occurrences: IPaymentOccurrence[]
}

export function OccurrencesTableView({
  occurrences,
}: IOccurrencesTableViewProps) {
  return (
    <ScrollTable minWidth={TABLE_MIN_WIDTH}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Название</Table.Th>
          <Table.Th ta='right' w={120}>
            Сумма
          </Table.Th>
          <Table.Th w={90}>Валюта</Table.Th>
          <Table.Th w={120}>Срок оплаты</Table.Th>
          <Table.Th w={150}>Статус</Table.Th>
          <Table.Th w={130}>Дата оплаты</Table.Th>
          <Table.Th ta='right' w={110}>
            Просрочка
          </Table.Th>
          <Table.Th w={196}>Действие</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {occurrences.map((occurrence) => {
          const status = getOccurrenceStatus(occurrence.status)

          return (
            <Table.Tr key={occurrence.id}>
              <Table.Td fw={600}>{occurrence.name}</Table.Td>
              <Table.Td ta='right'>{formatAmount(occurrence.amount)}</Table.Td>
              <Table.Td>{occurrence.currency}</Table.Td>
              <Table.Td>{formatShortDate(occurrence.dueDate)}</Table.Td>
              <Table.Td>
                <Text span c={status.color} fz='sm'>
                  {status.label}
                </Text>
              </Table.Td>
              <Table.Td>{formatPaymentDate(occurrence)}</Table.Td>
              <Table.Td ta='right'>{formatOverdue(occurrence)}</Table.Td>
              <Table.Td>
                <MarkPaymentButton occurrence={occurrence} />
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </ScrollTable>
  )
}
