import { Table, Text } from '@mantine/core'

import {
  formatOverdue,
  formatPaymentDate,
  getOccurrenceStatus,
  type IPaymentOccurrence,
  type TOccurrenceStatus,
} from '@/entities/payment-occurrence'
import { MarkPaymentButton } from '@/features/mark-payment'
import {
  formatAmount,
  formatShortDate,
  type TSortGetters,
  useSort,
} from '@/shared/lib'
import { ScrollTable, SortableTh } from '@/shared/ui'

const TABLE_MIN_WIDTH = 1160

const STATUS_ORDER: Record<TOccurrenceStatus, number> = {
  overdue: 0,
  unpaid: 1,
  paid: 2,
}

type TSortKey =
  | 'name'
  | 'amount'
  | 'currency'
  | 'dueDate'
  | 'status'
  | 'paymentDate'
  | 'overdueDays'

const SORT_GETTERS: TSortGetters<IPaymentOccurrence, TSortKey> = {
  name: (occurrence) => occurrence.name,
  amount: (occurrence) => occurrence.amount,
  currency: (occurrence) => occurrence.currency,
  dueDate: (occurrence) => occurrence.dueDate,
  status: (occurrence) => STATUS_ORDER[occurrence.status],
  paymentDate: (occurrence) => occurrence.paymentDate ?? '',
  overdueDays: (occurrence) => occurrence.overdueDays,
}

interface IOccurrencesTableViewProps {
  occurrences: IPaymentOccurrence[]
}

export function OccurrencesTableView({
  occurrences,
}: IOccurrencesTableViewProps) {
  const { sortedRows, sort, toggleSort } = useSort(occurrences, SORT_GETTERS)

  function getSortProps(key: TSortKey) {
    return {
      direction: sort?.key === key ? sort.direction : null,
      onSort: () => toggleSort(key),
    }
  }

  return (
    <ScrollTable minWidth={TABLE_MIN_WIDTH}>
      <Table.Thead>
        <Table.Tr>
          <SortableTh {...getSortProps('name')}>Название</SortableTh>
          <SortableTh ta='right' w={120} {...getSortProps('amount')}>
            Сумма
          </SortableTh>
          <SortableTh w={90} {...getSortProps('currency')}>
            Валюта
          </SortableTh>
          <SortableTh w={140} {...getSortProps('dueDate')}>
            Срок оплаты
          </SortableTh>
          <SortableTh w={150} {...getSortProps('status')}>
            Статус
          </SortableTh>
          <SortableTh w={130} {...getSortProps('paymentDate')}>
            Дата оплаты
          </SortableTh>
          <SortableTh ta='right' w={110} {...getSortProps('overdueDays')}>
            Просрочка
          </SortableTh>
          <Table.Th w={196}>Действие</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedRows.map((occurrence) => {
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
