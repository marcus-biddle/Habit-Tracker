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
    
    // Streak metrics
    const streaks = stats.map((s: DashboardHabit) => s.current_streak ?? 0)
    const activeStreaks = streaks.filter((s: number) => s > 0)
    const avgStreak = activeStreaks.length > 0
      ? Math.round(activeStreaks.reduce((sum: number, s: number) => sum + s, 0) / activeStreaks.length)
      : 0
    const bestStreakEver = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.longest_streak ?? 0))
      : 0
    const habitsWithStreaks = activeStreaks.length
    const totalStreakDays = streaks.reduce((sum: number, s: number) => sum + s, 0)
    
    // Completion metrics
    const avgWeekCompletion = stats.length > 0
      ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / stats.length)
      : 0
    
    // Frequency breakdown
    const dailyHabits = habits.filter(h => !h.goal_period || h.goal_period === 'per_day').length
    const weeklyHabits = habits.filter(h => h.goal_period === 'per_week').length
    const monthlyHabits = habits.filter(h => h.goal_period === 'per_month').length
    
    // Active habits breakdown
    const activeDaily = habits.filter(h => h.status === 'active' && !h.is_archived && (!h.goal_period || h.goal_period === 'per_day')).length
    const activeWeekly = habits.filter(h => h.status === 'active' && !h.is_archived && h.goal_period === 'per_week').length
    const activeMonthly = habits.filter(h => h.status === 'active' && !h.is_archived && h.goal_period === 'per_month').length

    return { 
      active, 
      inactive, 
      archived, 
      total, 
      avgStreak,
      bestStreakEver,
      habitsWithStreaks,
      totalStreakDays,
      avgWeekCompletion,
      dailyHabits,
      weeklyHabits,
      monthlyHabits,
      activeDaily,
      activeWeekly,
      activeMonthly
    }
  }, [habits, stats])

  return summaryStats
}

