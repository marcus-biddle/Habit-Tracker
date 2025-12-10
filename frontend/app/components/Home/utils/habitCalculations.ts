import type { Habit } from '../../Tables/Habits/columns'

/**
 * Get the effective goal for a habit based on tracking type and goal period
 */
export function getEffectiveGoal(habit: Habit): number {
  const trackingType = habit.tracking_type || 'count'
  const goal = habit.goal ?? 1
  
  // Binary habits always have goal of 1
  if (trackingType === 'binary') {
    return 1
  }
  
  // For other types, return the goal as-is
  // Note: goal_period is handled at the display/calculation level, not here
  return goal
}

/**
 * Check if a habit goal is met based on current value
 */
export function isGoalMet(habit: Habit, currentValue: number): boolean {
  const trackingType = habit.tracking_type || 'count'
  const effectiveGoal = getEffectiveGoal(habit)
  
  if (trackingType === 'binary') {
    return currentValue >= 1
  }
  
  return currentValue >= effectiveGoal
}

/**
 * Calculate progress percentage for a habit
 */
export function calculateProgress(habit: Habit, currentValue: number): number {
  const effectiveGoal = getEffectiveGoal(habit)
  
  if (effectiveGoal === 0) {
    return 0
  }
  
  return Math.min((currentValue / effectiveGoal) * 100, 100)
}

/**
 * Get display unit for a habit (unit_display if available, otherwise unit)
 */
export function getDisplayUnit(habit: Habit): string {
  if (habit.tracking_type === 'binary') {
    return ''
  }
  
  return habit.unit_display || habit.unit || 'unit'
}

/**
 * Get goal period display text
 */
export function getGoalPeriodText(goalPeriod: Habit['goal_period']): string {
  switch (goalPeriod) {
    case 'per_day':
      return 'per day'
    case 'per_week':
      return 'per week'
    case 'per_month':
      return 'per month'
    default:
      return 'per day'
  }
}

/**
 * Get the effective current value for a habit based on goal period
 * For weekly/monthly goals, use period_total; for daily goals, use daily value
 */
export function getEffectiveCurrentValue(
  habit: Habit,
  dailyValue: number,
  periodTotal: number | null | undefined
): number {
  const goalPeriod = habit.goal_period || 'per_day'
  
  // For weekly/monthly goals, use period total if available
  if (goalPeriod === 'per_week' || goalPeriod === 'per_month') {
    return periodTotal ?? 0
  }
  
  // For daily goals, use daily value
  return dailyValue
}

/**
 * Format value display based on tracking type
 */
export function formatValue(habit: Habit, value: number): string {
  const trackingType = habit.tracking_type || 'count'
  
  if (trackingType === 'binary') {
    return value >= 1 ? 'Completed' : 'Not completed'
  }
  
  // For other types, return the numeric value
  return value.toString()
}

