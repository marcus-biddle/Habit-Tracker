import { Card, CardContent, CardDescription, CardHeader } from '../../ui/card'
import { Carousel, CarouselContent, CarouselItem } from '../../ui/carousel'
import { Flame, Target, TrendingUp, Calendar, Clock, CheckCircle2, Archive, Zap } from 'lucide-react'

interface SummaryStats {
  total: number
  active: number
  inactive: number
  archived: number
  avgStreak: number
  bestStreakEver: number
  habitsWithStreaks: number
  totalStreakDays: number
  avgWeekCompletion: number
  dailyHabits: number
  weeklyHabits: number
  monthlyHabits: number
  activeDaily: number
  activeWeekly: number
  activeMonthly: number
}

interface SummaryStatsCardsProps {
  stats: SummaryStats
}

// Ordered from most valuable to least valuable for users
const statCards = [
  // Most important: Current status and momentum
  {
    key: 'active',
    description: 'Active',
    value: (stats: SummaryStats) => stats.active,
    className: 'text-primary',
    icon: CheckCircle2
  },
  {
    key: 'avgStreak',
    description: 'Avg Streak',
    value: (stats: SummaryStats) => `${stats.avgStreak} days`,
    className: '',
    icon: Flame
  },
  {
    key: 'avgWeekCompletion',
    description: 'Week Completion',
    value: (stats: SummaryStats) => `${stats.avgWeekCompletion}%`,
    className: 'text-primary',
    icon: Target
  },
  {
    key: 'habitsWithStreaks',
    description: 'With Streaks',
    value: (stats: SummaryStats) => stats.habitsWithStreaks,
    className: 'text-primary',
    icon: TrendingUp
  },
  // Achievement and motivation metrics
  {
    key: 'bestStreakEver',
    description: 'Best Streak',
    value: (stats: SummaryStats) => `${stats.bestStreakEver} days`,
    className: 'text-chart-4',
    icon: Zap
  },
  {
    key: 'totalStreakDays',
    description: 'Total Streak Days',
    value: (stats: SummaryStats) => stats.totalStreakDays,
    className: 'text-chart-4',
    icon: Flame
  },
  // Frequency breakdowns (most common first)
  {
    key: 'activeDaily',
    description: 'Daily Habits',
    value: (stats: SummaryStats) => stats.activeDaily,
    className: 'text-primary',
    icon: Calendar,
    subtitle: (stats: SummaryStats) => `${stats.dailyHabits} total`
  },
  {
    key: 'activeWeekly',
    description: 'Weekly Habits',
    value: (stats: SummaryStats) => stats.activeWeekly,
    className: 'text-primary',
    icon: Calendar,
    subtitle: (stats: SummaryStats) => `${stats.weeklyHabits} total`
  },
  {
    key: 'activeMonthly',
    description: 'Monthly Habits',
    value: (stats: SummaryStats) => stats.activeMonthly,
    className: 'text-primary',
    icon: Calendar,
    subtitle: (stats: SummaryStats) => `${stats.monthlyHabits} total`
  },
  // Overview metrics (less actionable)
  {
    key: 'total',
    description: 'Total Habits',
    value: (stats: SummaryStats) => stats.total,
    className: '',
    icon: Target
  },
  {
    key: 'inactive',
    description: 'Inactive',
    value: (stats: SummaryStats) => stats.inactive,
    className: 'text-muted-foreground',
    icon: Clock
  },
  {
    key: 'archived',
    description: 'Archived',
    value: (stats: SummaryStats) => stats.archived,
    className: 'text-muted-foreground',
    icon: Archive
  }
]

export function SummaryStatsCards({ stats }: SummaryStatsCardsProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 max-w-full">
          {statCards.map((card) => {
            const Icon = card.icon
            const hasSubtitle = card.subtitle !== undefined
            return (
              <CarouselItem
                key={card.key}
                className="pl-2 md:pl-4"
                style={{
                  minWidth: 'min(100%, 280px)',
                  maxWidth: 'min(100%, 280px)',
                  flex: '0 0 min(100%, 280px)'
                }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon className={`h-4 w-4 ${card.className || 'text-muted-foreground'}`} />
                      )}
                      <CardDescription className="text-xs">{card.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.className}`}>
                      {card.value(stats)}
                    </div>
                    {hasSubtitle && card.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {card.subtitle(stats)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

