import { Link } from 'react-router'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Folder, Flame, Calendar, TrendingUp } from 'lucide-react'

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

interface UngroupedHabitsSectionProps {
  ungroupedCount: number
  ungroupedStats: UngroupedStats
}

export function UngroupedHabitsSection({
  ungroupedCount,
  ungroupedStats
}: UngroupedHabitsSectionProps) {
  if (ungroupedCount === 0) return null

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Ungrouped Habits</h3>
          <p className="text-sm text-muted-foreground">
            {ungroupedCount} habit{ungroupedCount !== 1 ? 's' : ''} not in a group
          </p>
        </div>
        <Link to="/dashboard/habits">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Organize Habits
            <Folder className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <Card className="mb-4 w-full">
        <CardContent className="p-4">
          {/* Overall Stats */}
          <div 
            className="grid gap-4 w-full mb-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))'
            }}
          >
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="text-lg font-semibold">{ungroupedStats.totalHabits}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Completed</div>
              <div className="text-lg font-semibold text-primary">
                {ungroupedStats.completedToday}/{ungroupedStats.totalHabits}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Weighted Progress</div>
              <div className="text-lg font-semibold">{ungroupedStats.weightedCompletionRate}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg Streak</div>
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-lg font-semibold">{ungroupedStats.avgStreak}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg Progress</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
                <span className="text-lg font-semibold">{ungroupedStats.avgProgress}%</span>
              </div>
            </div>
          </div>

          {/* Frequency Breakdown */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Frequency Breakdown
            </h4>
            <div 
              className="grid gap-4 w-full"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))'
              }}
            >
              {/* Daily Habits */}
              {ungroupedStats.dailyHabits.count > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Daily Habits</div>
                  <div className="text-sm font-semibold">
                    {ungroupedStats.dailyHabits.count} habit{ungroupedStats.dailyHabits.count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ungroupedStats.dailyHabits.atGoal} at goal ({ungroupedStats.dailyHabits.completionRate}%)
                  </div>
                </div>
              )}

              {/* Weekly Habits */}
              {ungroupedStats.weeklyHabits.count > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Weekly Habits</div>
                  <div className="text-sm font-semibold">
                    {ungroupedStats.weeklyHabits.count} habit{ungroupedStats.weeklyHabits.count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ungroupedStats.weeklyHabits.atGoal} at goal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Week: {ungroupedStats.weeklyHabits.weekCompletion}% • Progress: {ungroupedStats.weeklyHabits.avgProgress}%
                  </div>
                </div>
              )}

              {/* Monthly Habits */}
              {ungroupedStats.monthlyHabits.count > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Monthly Habits</div>
                  <div className="text-sm font-semibold">
                    {ungroupedStats.monthlyHabits.count} habit{ungroupedStats.monthlyHabits.count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ungroupedStats.monthlyHabits.atGoal} at goal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Month: {ungroupedStats.monthlyHabits.monthCompletion}% • Progress: {ungroupedStats.monthlyHabits.avgProgress}%
                  </div>
                </div>
              )}

              {/* Show message if no frequency breakdown available */}
              {ungroupedStats.dailyHabits.count === 0 && 
               ungroupedStats.weeklyHabits.count === 0 && 
               ungroupedStats.monthlyHabits.count === 0 && (
                <div className="text-xs text-muted-foreground col-span-full">
                  No frequency data available
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

