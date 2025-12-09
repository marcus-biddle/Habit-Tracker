import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface StreakPerformanceCardProps {
  currentStreak: number
  avgStreak: number
  habitsWithStreaks: number
  bestStreakEver: number
  atRisk: number
}

export function StreakPerformanceCard({
  currentStreak,
  avgStreak,
  habitsWithStreaks,
  bestStreakEver,
  atRisk
}: StreakPerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-full min-w-0"
    >
      <Link to="/dashboard/analytics">
        <Card className="cursor-pointer hover:shadow-md transition-shadow w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak Performance</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{currentStreak}</div>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Longest active streak
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average streak</span>
                <span className="font-medium flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {avgStreak} days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active streaks</span>
                <span className="font-medium">{habitsWithStreaks} habits</span>
              </div>
              {bestStreakEver > currentStreak && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Best ever</span>
                  <span className="font-medium text-primary">{bestStreakEver} days</span>
                </div>
              )}
              {atRisk > 0 && (
                <div className="flex items-center justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground">At risk</span>
                  <span className="font-medium text-orange-500">{atRisk} streak{atRisk !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

