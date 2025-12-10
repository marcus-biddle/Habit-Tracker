import { useMemo } from 'react'
import type { Habit, HabitGroup } from '../../Tables/Habits/columns'
import type { DashboardHabit } from '../../../features/overview/table'
import { isGoalMet, calculateProgress, getEffectiveGoal, getEffectiveCurrentValue } from '../utils/habitCalculations'

interface GroupStats {
  groupId: string
  totalHabits: number
  completedToday: number
  completionRate: number
  totalStreak: number
  avgStreak: number
  totalProgress: number
  avgProgress: number
  // Frequency breakdowns
  dailyHabits: {
    count: number
    atGoal: number
    completionRate: number
  }
  weeklyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    weekCompletion: number
  }
  monthlyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    monthCompletion: number
  }
  // Weighted completion rate that accounts for frequencies
  weightedCompletionRate: number
}

interface UngroupedStats {
  totalHabits: number
  completedToday: number
  completionRate: number
  avgStreak: number
  avgProgress: number
  // Frequency breakdowns
  dailyHabits: {
    count: number
    atGoal: number
    completionRate: number
  }
  weeklyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    weekCompletion: number
  }
  monthlyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    monthCompletion: number
  }
  // Weighted completion rate that accounts for frequencies
  weightedCompletionRate: number
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
  dailyHabits: {
    count: number
    atGoal: number
  }
  weeklyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    weekCompletion: number
  }
  monthlyHabits: {
    count: number
    atGoal: number
    avgProgress: number
    monthCompletion: number
  }
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
          avgProgress: 0,
          dailyHabits: { count: 0, atGoal: 0, completionRate: 0 },
          weeklyHabits: { count: 0, atGoal: 0, avgProgress: 0, weekCompletion: 0 },
          monthlyHabits: { count: 0, atGoal: 0, avgProgress: 0, monthCompletion: 0 },
          weightedCompletionRate: 0
        }
      }

      // Break down habits by frequency
      const dailyHabits = groupHabits.filter(h => !h.goal_period || h.goal_period === 'per_day')
      const weeklyHabits = groupHabits.filter(h => h.goal_period === 'per_week')
      const monthlyHabits = groupHabits.filter(h => h.goal_period === 'per_month')

      // Calculate habits at goal (using period totals for weekly/monthly)
      const completedToday = groupHabits.filter(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return isGoalMet(habit, currentValue)
      }).length

      // Daily habits metrics
      const dailyHabitsAtGoal = dailyHabits.filter(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return isGoalMet(habit, currentValue)
      }).length
      const dailyCompletionRate = dailyHabits.length > 0 
        ? Math.round((dailyHabitsAtGoal / dailyHabits.length) * 100) 
        : 0

      // Weekly habits metrics
      const weeklyHabitsAtGoal = weeklyHabits.filter(habit => {
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return isGoalMet(habit, currentValue)
      }).length

      const weeklyProgressData = weeklyHabits.map(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return calculateProgress(habit, currentValue)
      })
      const avgWeeklyProgress = weeklyProgressData.length > 0
        ? Math.round(weeklyProgressData.reduce((sum, p) => sum + p, 0) / weeklyProgressData.length)
        : 0

      const weeklyHabitsWeekCompletion = weeklyHabits.length > 0
        ? Math.round(
            weeklyHabits.reduce((sum, habit) => {
              const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
              return sum + (habitStat?.week_completion ?? 0)
            }, 0) / weeklyHabits.length
          )
        : 0

      // Monthly habits metrics
      const monthlyHabitsAtGoal = monthlyHabits.filter(habit => {
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return isGoalMet(habit, currentValue)
      }).length

      const monthlyProgressData = monthlyHabits.map(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return calculateProgress(habit, currentValue)
      })
      const avgMonthlyProgress = monthlyProgressData.length > 0
        ? Math.round(monthlyProgressData.reduce((sum, p) => sum + p, 0) / monthlyProgressData.length)
        : 0

      const monthlyHabitsMonthCompletion = monthlyHabits.length > 0
        ? Math.round(
            monthlyHabits.reduce((sum, habit) => {
              const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
              return sum + (habitStat?.week_completion ?? 0) // week_completion contains monthly % for monthly habits
            }, 0) / monthlyHabits.length
          )
        : 0

      // Calculate weighted completion rate
      // For daily: use completion rate
      // For weekly: use week completion percentage
      // For monthly: use month completion percentage
      // Weight by number of habits in each category
      let weightedSum = 0
      let totalWeight = 0
      
      if (dailyHabits.length > 0) {
        weightedSum += dailyCompletionRate * dailyHabits.length
        totalWeight += dailyHabits.length
      }
      
      if (weeklyHabits.length > 0) {
        weightedSum += weeklyHabitsWeekCompletion * weeklyHabits.length
        totalWeight += weeklyHabits.length
      }
      
      if (monthlyHabits.length > 0) {
        weightedSum += monthlyHabitsMonthCompletion * monthlyHabits.length
        totalWeight += monthlyHabits.length
      }
      
      const weightedCompletionRate = totalWeight > 0 
        ? Math.round(weightedSum / totalWeight) 
        : 0

      // Overall completion rate (simple count-based)
      const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

      const groupStatsData = groupHabits.map(habit => 
        stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      ).filter(Boolean) as DashboardHabit[]

      const totalStreak = groupStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0)
      const avgStreak = groupStatsData.length > 0 ? Math.round(totalStreak / groupStatsData.length) : 0

      const progressData = groupHabits.map(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
        const dailyValue = sum?.value ?? 0
        const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
        const periodTotal = habitStat?.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        return calculateProgress(habit, currentValue)
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
        avgProgress,
        dailyHabits: {
          count: dailyHabits.length,
          atGoal: dailyHabitsAtGoal,
          completionRate: dailyCompletionRate
        },
        weeklyHabits: {
          count: weeklyHabits.length,
          atGoal: weeklyHabitsAtGoal,
          avgProgress: avgWeeklyProgress,
          weekCompletion: weeklyHabitsWeekCompletion
        },
        monthlyHabits: {
          count: monthlyHabits.length,
          atGoal: monthlyHabitsAtGoal,
          avgProgress: avgMonthlyProgress,
          monthCompletion: monthlyHabitsMonthCompletion
        },
        weightedCompletionRate
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
        avgProgress: 0,
        dailyHabits: { count: 0, atGoal: 0, completionRate: 0 },
        weeklyHabits: { count: 0, atGoal: 0, avgProgress: 0, weekCompletion: 0 },
        monthlyHabits: { count: 0, atGoal: 0, avgProgress: 0, monthCompletion: 0 },
        weightedCompletionRate: 0
      }
    }

    // Break down habits by frequency
    const dailyHabits = ungroupedHabits.filter(h => !h.goal_period || h.goal_period === 'per_day')
    const weeklyHabits = ungroupedHabits.filter(h => h.goal_period === 'per_week')
    const monthlyHabits = ungroupedHabits.filter(h => h.goal_period === 'per_month')

    // Calculate habits at goal (using period totals for weekly/monthly)
    const completedToday = ungroupedHabits.filter(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length

    // Daily habits metrics
    const dailyHabitsAtGoal = dailyHabits.filter(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length
    const dailyCompletionRate = dailyHabits.length > 0 
      ? Math.round((dailyHabitsAtGoal / dailyHabits.length) * 100) 
      : 0

    // Weekly habits metrics
    const weeklyHabitsAtGoal = weeklyHabits.filter(habit => {
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length

    const weeklyProgressData = weeklyHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return calculateProgress(habit, currentValue)
    })
    const avgWeeklyProgress = weeklyProgressData.length > 0
      ? Math.round(weeklyProgressData.reduce((sum, p) => sum + p, 0) / weeklyProgressData.length)
      : 0

    const weeklyHabitsWeekCompletion = weeklyHabits.length > 0
      ? Math.round(
          weeklyHabits.reduce((sum, habit) => {
            const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
            return sum + (habitStat?.week_completion ?? 0)
          }, 0) / weeklyHabits.length
        )
      : 0

    // Monthly habits metrics
    const monthlyHabitsAtGoal = monthlyHabits.filter(habit => {
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length

    const monthlyProgressData = monthlyHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return calculateProgress(habit, currentValue)
    })
    const avgMonthlyProgress = monthlyProgressData.length > 0
      ? Math.round(monthlyProgressData.reduce((sum, p) => sum + p, 0) / monthlyProgressData.length)
      : 0

    const monthlyHabitsMonthCompletion = monthlyHabits.length > 0
      ? Math.round(
          monthlyHabits.reduce((sum, habit) => {
            const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
            return sum + (habitStat?.week_completion ?? 0) // week_completion contains monthly % for monthly habits
          }, 0) / monthlyHabits.length
        )
      : 0

    // Calculate weighted completion rate
    // For daily: use completion rate
    // For weekly: use week completion percentage
    // For monthly: use month completion percentage
    // Weight by number of habits in each category
    let weightedSum = 0
    let totalWeight = 0
    
    if (dailyHabits.length > 0) {
      weightedSum += dailyCompletionRate * dailyHabits.length
      totalWeight += dailyHabits.length
    }
    
    if (weeklyHabits.length > 0) {
      weightedSum += weeklyHabitsWeekCompletion * weeklyHabits.length
      totalWeight += weeklyHabits.length
    }
    
    if (monthlyHabits.length > 0) {
      weightedSum += monthlyHabitsMonthCompletion * monthlyHabits.length
      totalWeight += monthlyHabits.length
    }
    
    const weightedCompletionRate = totalWeight > 0 
      ? Math.round(weightedSum / totalWeight) 
      : 0

    // Overall completion rate (simple count-based)
    const completionRate = ungroupedHabits.length > 0 ? Math.round((completedToday / ungroupedHabits.length) * 100) : 0

    const ungroupedStatsData = ungroupedHabits.map(habit => 
      stats.find((s: DashboardHabit) => s.habit_id === habit.id)
    ).filter(Boolean) as DashboardHabit[]

    const totalStreak = ungroupedStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0)
    const avgStreak = ungroupedStatsData.length > 0 ? Math.round(totalStreak / ungroupedStatsData.length) : 0

    const progressData = ungroupedHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return calculateProgress(habit, currentValue)
    })
    const totalProgress = progressData.reduce((sum, p) => sum + p, 0)
    const avgProgress = progressData.length > 0 ? Math.round(totalProgress / progressData.length) : 0

    return {
      totalHabits: ungroupedHabits.length,
      completedToday,
      completionRate,
      avgStreak,
      avgProgress,
      dailyHabits: {
        count: dailyHabits.length,
        atGoal: dailyHabitsAtGoal,
        completionRate: dailyCompletionRate
      },
      weeklyHabits: {
        count: weeklyHabits.length,
        atGoal: weeklyHabitsAtGoal,
        avgProgress: avgWeeklyProgress,
        weekCompletion: weeklyHabitsWeekCompletion
      },
      monthlyHabits: {
        count: monthlyHabits.length,
        atGoal: monthlyHabitsAtGoal,
        avgProgress: avgMonthlyProgress,
        monthCompletion: monthlyHabitsMonthCompletion
      },
      weightedCompletionRate
    }
  }, [habitsByGroup.ungrouped, dailySums, stats])

  const todayStats = useMemo(() => {
    // Count habits that have met their goal (using period totals for weekly/monthly)
    const habitsAtGoalToday = activeHabits.filter(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length
    
    // Count habits with any entries today (for "completed" metric)
    const habitsWithEntriesToday = dailySums.filter((ds: { id: string; value: number }) => ds.value > 0).length
    const totalActive = activeHabits.length
    const todayCompletionRate = totalActive > 0 
      ? Math.round((habitsAtGoalToday / totalActive) * 100) 
      : 0
    const remaining = totalActive - habitsAtGoalToday

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
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      const effectiveGoal = getEffectiveGoal(habit)
      const progress = calculateProgress(habit, currentValue)
      return {
        habitId: habit.id,
        currentValue,
        goal: effectiveGoal,
        progress,
        isCompleted: isGoalMet(habit, currentValue)
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

    // Breakdown by goal period
    const dailyHabits = activeHabits.filter(h => !h.goal_period || h.goal_period === 'per_day')
    const weeklyHabits = activeHabits.filter(h => h.goal_period === 'per_week')
    const monthlyHabits = activeHabits.filter(h => h.goal_period === 'per_month')

    const weeklyHabitsAtGoal = weeklyHabits.filter(habit => {
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length

    const monthlyHabitsAtGoal = monthlyHabits.filter(habit => {
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return isGoalMet(habit, currentValue)
    }).length

    const weeklyProgressData = weeklyHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return calculateProgress(habit, currentValue)
    })
    const avgWeeklyProgress = weeklyProgressData.length > 0
      ? Math.round(weeklyProgressData.reduce((sum, p) => sum + p, 0) / weeklyProgressData.length)
      : 0

    const monthlyProgressData = monthlyHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
      const dailyValue = sum?.value ?? 0
      const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      const periodTotal = habitStat?.period_total ?? null
      const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
      return calculateProgress(habit, currentValue)
    })
    const avgMonthlyProgress = monthlyProgressData.length > 0
      ? Math.round(monthlyProgressData.reduce((sum, p) => sum + p, 0) / monthlyProgressData.length)
      : 0

    // Get week completion for weekly habits and month completion for monthly habits
    const weeklyHabitsWeekCompletion = weeklyHabits.length > 0
      ? Math.round(
          weeklyHabits.reduce((sum, habit) => {
            const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
            return sum + (habitStat?.week_completion ?? 0)
          }, 0) / weeklyHabits.length
        )
      : 0

    const monthlyHabitsMonthCompletion = monthlyHabits.length > 0
      ? Math.round(
          monthlyHabits.reduce((sum, habit) => {
            const habitStat = stats.find((s: DashboardHabit) => s.habit_id === habit.id)
            return sum + (habitStat?.week_completion ?? 0) // week_completion contains monthly % for monthly habits
          }, 0) / monthlyHabits.length
        )
      : 0

    return {
      completed: habitsAtGoalToday,
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
      totalCurrentValue: totalCurrentValue,
      // Goal period breakdowns
      dailyHabits: {
        count: dailyHabits.length,
        atGoal: habitsAtGoalToday - weeklyHabitsAtGoal - monthlyHabitsAtGoal
      },
      weeklyHabits: {
        count: weeklyHabits.length,
        atGoal: weeklyHabitsAtGoal,
        avgProgress: avgWeeklyProgress,
        weekCompletion: weeklyHabitsWeekCompletion
      },
      monthlyHabits: {
        count: monthlyHabits.length,
        atGoal: monthlyHabitsAtGoal,
        avgProgress: avgMonthlyProgress,
        monthCompletion: monthlyHabitsMonthCompletion
      }
    }
  }, [dailySums, activeHabits, stats])

  return {
    groupStats,
    ungroupedStats,
    todayStats
  }
}

