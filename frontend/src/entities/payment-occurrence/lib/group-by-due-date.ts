import type { IPaymentOccurrence } from '../model/types'

export function groupByDueDate(occurrences: IPaymentOccurrence[]) {
  const groups = new Map<string, IPaymentOccurrence[]>()

  for (const occurrence of occurrences) {
    groups.set(occurrence.dueDate, [
      ...(groups.get(occurrence.dueDate) ?? []),
      occurrence,
    ])
  }

  return groups
}
