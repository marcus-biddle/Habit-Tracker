import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface TodaysProgressCardProps {
  completionRate: number
  completed: number
  total: number
  habitsAtGoal: number
  avgProgress: number
  totalEntries: number
  remaining: number
}

export function TodaysProgressCard({
  completionRate,
  completed,
  total,
  habitsAtGoal,
  avgProgress,
  totalEntries,
  remaining
}: TodaysProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-w-0"
    >
      <Link to="/dashboard">
        <Card className="cursor-pointer hover:shadow-md transition-shadow w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{completionRate}%</div>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completed} of {total} habits logged
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">At goal</span>
                <span className="font-medium text-primary">{habitsAtGoal} habit{habitsAtGoal !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg progress</span>
                <span className="font-medium">{avgProgress}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total entries</span>
                <span className="font-medium">{totalEntries}</span>
              </div>
              {remaining > 0 && (
                <div className="flex items-center justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">{remaining}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

