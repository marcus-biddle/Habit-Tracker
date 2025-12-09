import { TZDate } from '@date-fns/tz';

export const today = new TZDate().toISOString().split('T')[0];

export function formatHabitDate(habitDate: string) {
  const date = new TZDate(habitDate)

  const now = new TZDate()
  const startOfToday = new TZDate(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new TZDate(date.getFullYear(), date.getMonth(), date.getDate())

  const diffMs = startOfToday.getTime() - startOfTarget.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleString()
}

