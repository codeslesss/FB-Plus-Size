function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatRelativeDateTime(date: Date): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (isSameDay(date, now)) return `Hoje, ${time}`
  if (isSameDay(date, yesterday)) return `Ontem, ${time}`

  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${day}, ${time}`
}
