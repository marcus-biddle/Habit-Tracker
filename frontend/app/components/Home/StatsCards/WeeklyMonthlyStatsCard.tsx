import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface WeeklyMonthlyStatsCardProps {
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

export function WeeklyMonthlyStatsCard({
  weeklyHabits,
  monthlyHabits
}: WeeklyMonthlyStatsCardProps) {
  const hasWeeklyHabits = weeklyHabits.count > 0
  const hasMonthlyHabits = monthlyHabits.count > 0

  if (!hasWeeklyHabits && !hasMonthlyHabits) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-full min-w-0"
    >
      <Link to="/dashboard/habits">
        <Card className="cursor-pointer hover:shadow-md transition-shadow w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly & Monthly Goals</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {hasWeeklyHabits && (
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Weekly Habits</span>
                    <span className="text-xs text-muted-foreground">({weeklyHabits.count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-sm font-bold text-primary">{weeklyHabits.weekCompletion}%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">At goal this week</span>
                    <span className="font-medium text-primary">{weeklyHabits.atGoal} / {weeklyHabits.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg progress</span>
                    <span className="font-medium">{weeklyHabits.avgProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {hasMonthlyHabits && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Monthly Habits</span>
                    <span className="text-xs text-muted-foreground">({monthlyHabits.count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-sm font-bold text-primary">{monthlyHabits.monthCompletion}%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">At goal this month</span>
                    <span className="font-medium text-primary">{monthlyHabits.atGoal} / {monthlyHabits.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg progress</span>
                    <span className="font-medium">{monthlyHabits.avgProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {!hasWeeklyHabits && !hasMonthlyHabits && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No weekly or monthly habits yet
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

