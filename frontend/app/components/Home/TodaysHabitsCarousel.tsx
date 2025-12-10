import { Link } from 'react-router'
import { Button } from '../ui/button'
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel'
import { Forward } from 'lucide-react'
import { EmptyHabitState } from '../EmptyHabitState'
import CSVImporter from '../../features/CSVImporter'
import { HabitCard } from './HabitCard'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'
import type { DashboardHabit } from '../../features/overview/table'
import { calculateProgress, getEffectiveCurrentValue } from './utils/habitCalculations'

interface TodaysHabitsCarouselProps {
  activeHabits: Habit[]
  allHabits: Habit[]
  dailySums: { id: string; value: number }[]
  stats: DashboardHabit[]
  groups: HabitGroup[]
  onQuickUpdate: (habitId: string, increment: number) => Promise<void>
  onManualUpdate: (habitId: string, value: number) => Promise<void>
}

export function TodaysHabitsCarousel({
  activeHabits,
  allHabits,
  dailySums,
  stats,
  groups,
  onQuickUpdate,
  onManualUpdate
}: TodaysHabitsCarouselProps) {
  if (activeHabits.length === 0) {
    return <EmptyHabitState />
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Today's Habits</h3>
          <p className="text-sm text-muted-foreground">Quick access to log your daily progress</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <CSVImporter habits={allHabits} />
          <Link to="/dashboard/analytics">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              View Analytics
              <Forward className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 max-w-full">
          {activeHabits.map((habit: Habit) => {
            const backendValue = dailySums.find((s: { id: string; value: number }) => s.id === habit.id)
            const dailyValue = backendValue?.value ?? 0
            const habitStats = stats?.find((s: DashboardHabit) => s.habit_id === habit.id)
            const periodTotal = habitStats?.period_total ?? null
            const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
            const progress = calculateProgress(habit, currentValue)
            const streak = habitStats?.current_streak ?? 0
            
            return (
              <CarouselItem 
                key={`${habit.id}-${currentValue}-${progress}`} 
                className="pl-2 md:pl-4"
                style={{
                  minWidth: 'min(100%, 320px)',
                  maxWidth: 'min(100%, 320px)',
                  flex: '0 0 min(100%, 320px)'
                }}
              >
                <HabitCard
                  habit={habit}
                  currentValue={currentValue}
                  progress={progress}
                  streak={streak}
                  groups={groups}
                  onQuickUpdate={onQuickUpdate}
                  onManualUpdate={onManualUpdate}
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

