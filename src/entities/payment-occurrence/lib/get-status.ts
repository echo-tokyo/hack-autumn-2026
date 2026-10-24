import type { TOccurrenceStatus } from '../model/types'

const STATUS_VIEWS: Record<
  TOccurrenceStatus,
  { label: string; color: string | undefined }
> = {
  paid: { label: 'Оплачено', color: 'var(--color-success)' },
  overdue: { label: 'Просрочено', color: 'var(--color-danger)' },
  unpaid: { label: 'Ожидает оплаты', color: undefined },
}

export function getOccurrenceStatus(status: TOccurrenceStatus) {
  return STATUS_VIEWS[status]
}
