import { Card, CardContent, CardDescription, CardHeader } from '../../ui/card'
import { Flame } from 'lucide-react'

interface SummaryStats {
  total: number
  active: number
  inactive: number
  archived: number
  avgStreak: number
}

interface SummaryStatsCardsProps {
  stats: SummaryStats
}

export function SummaryStatsCards({ stats }: SummaryStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Habits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.active}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Inactive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Archived</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{stats.archived}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Avg Streak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-chart-4" />
            <span className="text-2xl font-bold">{stats.avgStreak}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

