import { Link } from 'react-router'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Folder, Flame } from 'lucide-react'

interface UngroupedStats {
  totalHabits: number
  completedToday: number
  completionRate: number
  avgStreak: number
  avgProgress: number
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
          <div 
            className="grid gap-4 w-full"
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
              <div className="text-xs text-muted-foreground mb-1">Progress</div>
              <div className="text-lg font-semibold">{ungroupedStats.completionRate}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg Streak</div>
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-lg font-semibold">{ungroupedStats.avgStreak}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

