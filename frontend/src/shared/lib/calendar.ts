import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'

const ISO_DATE_FORMAT = 'yyyy-MM-dd'
const WEEK_OPTIONS = { weekStartsOn: 1 } as const

export interface ICalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
}

export function toMonthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

export function shiftMonth(month: string, amount: number): string {
  return format(addMonths(parseISO(month), amount), ISO_DATE_FORMAT)
}

export function formatMonthTitle(month: string): string {
  const title = format(parseISO(month), 'LLLL yyyy', { locale: ru })
  return title.charAt(0).toUpperCase() + title.slice(1)
}

export function getMonthDays(month: string): ICalendarDay[] {
  const monthDate = parseISO(month)
  const lastDay = endOfWeek(endOfMonth(monthDate), WEEK_OPTIONS)
  const days: ICalendarDay[] = []

  for (
    let date = startOfWeek(startOfMonth(monthDate), WEEK_OPTIONS);
    date <= lastDay;
    date = addDays(date, 1)
  ) {
    days.push({
      date: format(date, ISO_DATE_FORMAT),
      day: date.getDate(),
      isCurrentMonth: isSameMonth(date, monthDate),
    })
  }

  return days
}
