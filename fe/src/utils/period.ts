export type Period = 'today' | '7d' | '30d' | 'all'

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'all', label: 'Todo o período' },
]

export function isWithinPeriod(date: Date, period: Period): boolean {
  if (period === 'all') return true

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (period === 'today') {
    return date >= startOfToday
  }

  const days = period === '7d' ? 7 : 30
  const threshold = new Date(startOfToday)
  threshold.setDate(threshold.getDate() - (days - 1))
  return date >= threshold
}
