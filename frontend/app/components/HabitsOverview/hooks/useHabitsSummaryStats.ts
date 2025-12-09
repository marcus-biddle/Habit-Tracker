import { useMemo } from 'react'
import type { Habit } from '../../Tables/Habits/columns'
import type { DashboardHabit } from '../../../../features/overview/table'

export function useHabitsSummaryStats(
  habits: Habit[],
  stats: DashboardHabit[]
) {
  const summaryStats = useMemo(() => {
    const active = habits.filter(h => h.status === 'active' && !h.is_archived).length
    const inactive = habits.filter(h => h.status === 'inactive' && !h.is_archived).length
    const archived = habits.filter(h => h.is_archived).length
    const total = habits.length
    const avgStreak = stats.length > 0
      ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.current_streak ?? 0), 0) / stats.length)
      : 0

    return { active, inactive, archived, total, avgStreak }
  }, [habits, stats])

  return summaryStats
}

