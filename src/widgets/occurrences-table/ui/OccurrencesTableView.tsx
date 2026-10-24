import { Table, Text } from '@mantine/core'

import {
  getOccurrenceStatus,
  type IPaymentOccurrence,
} from '@/entities/payment-occurrence'
import { MarkPaymentButton } from '@/features/mark-payment'
import { formatAmount, formatShortDate } from '@/shared/lib'

const TABLE_MIN_WIDTH = 900
const TABLE_MIN_HEIGHT = 200
const FONT_WEIGHT = 400

interface IOccurrencesTableViewProps {
  occurrences: IPaymentOccurrence[]
  today: string
}

export function OccurrencesTableView({
  occurrences,
  today,
}: IOccurrencesTableViewProps) {
  return (
    <Table.ScrollContainer minWidth={TABLE_MIN_WIDTH} mih={TABLE_MIN_HEIGHT}>
      <Table verticalSpacing='sm' layout='fixed'>
        <Table.Thead>
          <Table.Tr c='dimmed'>
            <Table.Th fw={FONT_WEIGHT}>Название</Table.Th>
            <Table.Th fw={FONT_WEIGHT} ta='right' w={120}>
              Сумма
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} w={90}>
              Валюта
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} w={120}>
              Срок оплаты
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} w={150}>
              Статус
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} w={130}>
              Дата оплаты
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} ta='right' w={110}>
              Просрочка
            </Table.Th>
            <Table.Th fw={FONT_WEIGHT} w={170}>
              Действие
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {occurrences.map((occurrence) => {
            const status = getOccurrenceStatus(occurrence, today)

            return (
              <Table.Tr key={occurrence.id}>
                <Table.Td fw={600}>{occurrence.name}</Table.Td>
                <Table.Td ta='right' fw={FONT_WEIGHT}>
                  {formatAmount(occurrence.amount)}
                </Table.Td>
                <Table.Td>{occurrence.currency}</Table.Td>
                <Table.Td>{formatShortDate(occurrence.dueDate)}</Table.Td>
                <Table.Td>
                  <Text span c={status.color} fw={FONT_WEIGHT} fz='sm'>
                    {status.label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {occurrence.paymentDate
                    ? formatShortDate(occurrence.paymentDate)
                    : '-'}
                </Table.Td>
                <Table.Td ta='right'>
                  {status.overdueDays > 0 ? `${status.overdueDays} дн.` : '-'}
                </Table.Td>
                <Table.Td>
                  <MarkPaymentButton occurrence={occurrence} />
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}
