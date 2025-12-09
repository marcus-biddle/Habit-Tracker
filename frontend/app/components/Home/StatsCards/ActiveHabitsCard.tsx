import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface ActiveHabitsCardProps {
  total: number
  completed: number
  habitsAtGoal: number
  weekCompletion: number
  atRisk: number
  notStarted: number
}

export function ActiveHabitsCard({
  total,
  completed,
  habitsAtGoal,
  weekCompletion,
  atRisk,
  notStarted
}: ActiveHabitsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full min-w-0"
    >
      <Link to="/dashboard/habits">
        <Card className="cursor-pointer hover:shadow-md transition-shadow w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{total}</div>
              <span className="text-xs text-muted-foreground">habits</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently being tracked
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Logged today</span>
                <span className="font-medium text-primary">{completed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reached goal</span>
                <span className="font-medium">{habitsAtGoal}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This week</span>
                <span className="font-medium">{weekCompletion}%</span>
              </div>
              {(atRisk > 0 || notStarted > 0) && (
                <div className="pt-1 border-t space-y-1">
                  {atRisk > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">At risk</span>
                      <span className="font-medium text-orange-500">{atRisk}</span>
                    </div>
                  )}
                  {notStarted > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Not started</span>
                      <span className="font-medium">{notStarted}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

