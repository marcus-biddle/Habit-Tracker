import { useMemo } from 'react'
import type { Habit, HabitGroup } from '../../Tables/Habits/columns'
import type { DashboardHabit } from '../../../../features/overview/table'

interface GroupStats {
  groupId: string
  totalHabits: number
  completedToday: number
  completionRate: number
  totalStreak: number
  avgStreak: number
  totalProgress: number
  avgProgress: number
}

interface UngroupedStats {
  totalHabits: number
  completedToday: number
  completionRate: number
  avgStreak: number
  avgProgress: number
}

interface TodayStats {
  completed: number
  total: number
  remaining: number
  completionRate: number
  currentStreak: number
  avgStreak: number
  totalStreakDays: number
  habitsWithStreaks: number
  bestStreakEver: number
  totalEntries: number
  atRisk: number
  notStarted: number
  weekCompletion: number
  habitsAtGoal: number
  avgProgress: number
  overallProgress: number
  totalGoalValue: number
  totalCurrentValue: number
}

export function useHomeStats(
  activeHabits: Habit[],
  habitsByGroup: { grouped: Record<string, Habit[]>; ungrouped: Habit[] },
  groups: HabitGroup[],
  dailySums: { id: string; value: number }[],
  stats: DashboardHabit[]
) {
  const groupStats = useMemo(() => {
    return groups.map(group => {
      const groupHabits = habitsByGroup.grouped[group.id] || []
      const totalHabits = groupHabits.length
      
      if (totalHabits === 0) {
        return {
          groupId: group.id,
          totalHabits: 0,
          completedToday: 0,
          completionRate: 0,
          totalStreak: 0,
          avgStreak: 0,
          totalProgress: 0,
          avgProgress: 0
        }
      }

      const completedToday = groupHabits.filter(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        return (sum?.value ?? 0) > 0
      }).length

      const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

      const groupStatsData = groupHabits.map(habit => 
        stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      ).filter(Boolean) as DashboardHabit[]

      const totalStreak = groupStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0)
      const avgStreak = groupStatsData.length > 0 ? Math.round(totalStreak / groupStatsData.length) : 0

      const progressData = groupHabits.map(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const currentValue = sum?.value ?? 0
        const goal = habit.goal ?? 1
        return Math.min((currentValue / goal) * 100, 100)
      })
      const totalProgress = progressData.reduce((sum, p) => sum + p, 0)
      const avgProgress = progressData.length > 0 ? Math.round(totalProgress / progressData.length) : 0

      return {
        groupId: group.id,
        totalHabits,
        completedToday,
        completionRate,
        totalStreak,
        avgStreak,
        totalProgress,
        avgProgress
      }
    })
  }, [groups, habitsByGroup, dailySums, stats])

  const ungroupedStats = useMemo(() => {
    const ungroupedHabits = habitsByGroup.ungrouped
    if (ungroupedHabits.length === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        avgStreak: 0,
        avgProgress: 0
      }
    }

    const completedToday = ungroupedHabits.filter(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      return (sum?.value ?? 0) > 0
    }).length

    const completionRate = Math.round((completedToday / ungroupedHabits.length) * 100)

    const ungroupedStatsData = ungroupedHabits.map(habit => 
      stats.find((s: DashboardHabit) => s.habit_id === habit.id)
    ).filter(Boolean) as DashboardHabit[]

    const totalStreak = ungroupedStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0)
    const avgStreak = ungroupedStatsData.length > 0 ? Math.round(totalStreak / ungroupedStatsData.length) : 0

    const progressData = ungroupedHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const currentValue = sum?.value ?? 0
      const goal = habit.goal ?? 1
      return Math.min((currentValue / goal) * 100, 100)
    })
    const totalProgress = progressData.reduce((sum, p) => sum + p, 0)
    const avgProgress = progressData.length > 0 ? Math.round(totalProgress / progressData.length) : 0

    return {
      totalHabits: ungroupedHabits.length,
      completedToday,
      completionRate,
      avgStreak,
      avgProgress
    }
  }, [habitsByGroup.ungrouped, dailySums, stats])

  const todayStats = useMemo(() => {
    const habitsWithEntriesToday = dailySums.filter((ds: { id: string; value: number }) => ds.value > 0).length
    const totalActive = activeHabits.length
    const todayCompletionRate = totalActive > 0 
      ? Math.round((habitsWithEntriesToday / totalActive) * 100) 
      : 0
    const remaining = totalActive - habitsWithEntriesToday

    const currentLongestStreak = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.current_streak ?? 0))
      : 0

    const streaks = stats.map((s: DashboardHabit) => s.current_streak ?? 0)
    const activeStreaks = streaks.filter((s: number) => s > 0)
    const avgStreak = activeStreaks.length > 0
      ? Math.round(activeStreaks.reduce((sum: number, s: number) => sum + s, 0) / activeStreaks.length)
      : 0
    const totalStreakDays = streaks.reduce((sum: number, s: number) => sum + s, 0)
    const habitsWithStreaks = activeStreaks.length
    const bestStreakEver = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.longest_streak ?? 0))
      : 0

    const totalEntriesToday = dailySums.reduce((sum: number, ds: { id: string; value: number }) => sum + ds.value, 0)

    const atRisk = stats.filter((s: DashboardHabit) => {
      const hasEntryToday = dailySums.find((ds: { id: string; value: number }) => ds.id === s.habit_id)?.value ?? 0
      return hasEntryToday === 0 && (s.current_streak ?? 0) > 0
    }).length

    const notStarted = totalActive - habitsWithEntriesToday

    const weekCompletion = stats.length > 0
      ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / stats.length)
      : 0

    const progressData = activeHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const currentValue = sum?.value ?? 0
      const goal = habit.goal ?? 1
      return {
        habitId: habit.id,
        currentValue,
        goal,
        progress: Math.min((currentValue / goal) * 100, 100),
        isCompleted: currentValue >= goal
      }
    })

    const habitsAtGoal = progressData.filter(p => p.isCompleted).length
    const avgProgress = progressData.length > 0
      ? Math.round(progressData.reduce((sum: number, p) => sum + p.progress, 0) / progressData.length)
      : 0
    const totalGoalValue = progressData.reduce((sum: number, p) => sum + p.goal, 0)
    const totalCurrentValue = progressData.reduce((sum: number, p) => sum + p.currentValue, 0)
    const overallProgress = totalGoalValue > 0
      ? Math.round((totalCurrentValue / totalGoalValue) * 100)
      : 0

    return {
      completed: habitsWithEntriesToday,
      total: totalActive,
      remaining: remaining,
      completionRate: todayCompletionRate,
      currentStreak: currentLongestStreak,
      avgStreak: avgStreak,
      totalStreakDays: totalStreakDays,
      habitsWithStreaks: habitsWithStreaks,
      bestStreakEver: bestStreakEver,
      totalEntries: totalEntriesToday,
      atRisk: atRisk,
      notStarted: notStarted,
      weekCompletion: weekCompletion,
      habitsAtGoal: habitsAtGoal,
      avgProgress: avgProgress,
      overallProgress: overallProgress,
      totalGoalValue: totalGoalValue,
      totalCurrentValue: totalCurrentValue
    }
  }, [dailySums, activeHabits, stats])

  return {
    groupStats,
    ungroupedStats,
    todayStats
  }
}

