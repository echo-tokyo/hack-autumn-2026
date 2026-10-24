export { todayIso } from '@/shared/lib'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(iso: string) {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number)
  return { year, month, day }
}

export function addDays(iso: string, days: number) {
  const { year, month, day } = parseIsoDate(iso)
  return toIsoDate(new Date(year, month - 1, day + days))
}

export function addMonths(iso: string, months: number, dayOfMonth: number) {
  const { year, month } = parseIsoDate(iso)
  const lastDayOfMonth = new Date(year, month - 1 + months + 1, 0).getDate()
  const day = Math.min(dayOfMonth, lastDayOfMonth)
  return toIsoDate(new Date(year, month - 1 + months, day))
}

export function dayOfMonth(iso: string) {
  return parseIsoDate(iso).day
}
