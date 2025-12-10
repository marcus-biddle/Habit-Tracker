import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { Flame, Edit2 } from 'lucide-react'
import { TZDate } from '@date-fns/tz'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'
import type { DashboardHabit } from '../../features/overview/table'
import { getDisplayUnit, getEffectiveGoal, getGoalPeriodText } from '../Home/utils/habitCalculations'

interface HabitGridCardProps {
  habit: Habit
  groups: HabitGroup[]
  habitStats: DashboardHabit | undefined
  isSelected: boolean
  onToggleSelection: () => void
  onEdit: () => void
}

export function HabitGridCard({
  habit,
  groups,
  habitStats,
  isSelected,
  onToggleSelection,
  onEdit
}: HabitGridCardProps) {
  const group = habit.group_id ? groups.find(g => g.id === habit.group_id) : null

  return (
    <Card className={habit.is_archived ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="capitalize">{habit.name}</CardTitle>
              {group && (
                <Badge variant="outline" className="text-xs">
                  {group.color && (
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: group.color }}
                    />
                  )}
                  {group.name}
                </Badge>
              )}
            </div>
            {habit.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {habit.description}
              </CardDescription>
            )}
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={habit.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {habit.status}
          </Badge>
          {habit.is_archived && (
            <Badge variant="outline">Archived</Badge>
          )}
          {habit.tracking_type && (
            <Badge variant="outline" className="capitalize">
              {habit.tracking_type}
            </Badge>
          )}
          {habit.goal_period && habit.goal_period !== 'per_day' && (
            <Badge variant="outline" className="capitalize">
              {getGoalPeriodText(habit.goal_period)}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-medium">
              {habit.tracking_type === 'binary' 
                ? 'Completed/Not Completed'
                : `${getEffectiveGoal(habit)} ${getDisplayUnit(habit)}`
              }
              {habit.goal_period && habit.goal_period !== 'per_day' && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({getGoalPeriodText(habit.goal_period)})
                </span>
              )}
            </span>
          </div>
          {habitStats && (
            <>
              {habitStats.current_streak > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Streak</span>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-chart-4" />
                    <span className="font-medium">{habitStats.current_streak} days</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Week Completion</span>
                <span className="font-medium">{habitStats.week_completion ?? 0}%</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {new TZDate(habit.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link to={`/dashboard/habits/${habit.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

