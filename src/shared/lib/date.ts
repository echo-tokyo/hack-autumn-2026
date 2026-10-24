import { differenceInCalendarDays, format, parseISO } from 'date-fns'

import { SYSTEM_TIMEZONE } from '@/shared/config'

const systemDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SYSTEM_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function todayIso(): string {
  return systemDateFormatter.format(new Date())
}

export function daysBetween(fromIso: string, toIso: string): number {
  return differenceInCalendarDays(parseISO(toIso), parseISO(fromIso))
}

export function formatShortDate(iso: string): string {
  const isCurrentYear = iso.slice(0, 4) === todayIso().slice(0, 4)
  return format(parseISO(iso), isCurrentYear ? 'dd.MM' : 'dd.MM.yyyy')
}
