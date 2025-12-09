import { Card, CardContent } from '../../components/ui/card'
import { HabitGridCard } from './HabitGridCard'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'
import type { DashboardHabit } from '../../features/overview/table'

interface HabitsGridViewProps {
  habits: Habit[]
  groups: HabitGroup[]
  stats: DashboardHabit[]
  selectedRows: Set<string>
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive' | 'archived'
  onToggleSelection: (habitId: string) => void
  onEdit: (habit: Habit) => void
  getHabitStats: (habitId: string) => DashboardHabit | undefined
}

export function HabitsGridView({
  habits,
  groups,
  stats,
  selectedRows,
  searchQuery,
  statusFilter,
  onToggleSelection,
  onEdit,
  getHabitStats
}: HabitsGridViewProps) {
  if (habits.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No habits found. {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first habit to get started!'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        const habitStats = getHabitStats(habit.id)
        const isSelected = selectedRows.has(habit.id)
        
        return (
          <HabitGridCard
            key={habit.id}
            habit={habit}
            groups={groups}
            habitStats={habitStats}
            isSelected={isSelected}
            onToggleSelection={() => onToggleSelection(habit.id)}
            onEdit={() => onEdit(habit)}
          />
        )
      })}
    </div>
  )
}

