import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'
import { TZDate } from '@date-fns/tz'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../components/ui/chart'
import { Separator } from '../components/ui/separator'
import { 
  Target, 
  Flame, 
  Activity, 
  BarChart3,
  CheckCircle2,
  Filter
} from 'lucide-react'
import { 
  getHabitsByUserIdWithGroups, 
  getHabitGroupsByUserId,
  fetchHabitEntriesFor 
} from '../api/supabase'
import { supabase } from '../api/client/client'
import type { Habit, HabitGroup } from '../components/Tables/Habits/columns'
import type { DashboardHabit } from '../features/overview/table'
import { motion } from 'framer-motion'

export const today = new TZDate().toISOString().split('T')[0]

export async function clientLoader() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const habits: Habit[] = await getHabitsByUserIdWithGroups(user.id)
  const groups: HabitGroup[] = await getHabitGroupsByUserId(user.id)
  const { data: stats } = await supabase.rpc('get_habit_dashboard_stats', { 
    p_user_id: user.id 
  })

  // Fetch entries for all habits to calculate trends
  const entriesPromises = habits.map(habit => 
    fetchHabitEntriesFor(user.id, habit.id)
  )
  const allEntries = await Promise.all(entriesPromises)

  // Get daily sums for today
  const dailySumsPromises = habits.map(habit =>
    supabase.rpc('get_daily_habit_sum', {
      p_user_id: user.id,
      p_habit_id: habit.id,
      p_date: today
    })
  )
  const dailySumsResults = await Promise.all(dailySumsPromises)
  const dailySums = habits.map((habit, idx) => ({
    id: habit.id,
    value: dailySumsResults[idx].data ?? 0,
  }))

  return {
    user,
    habits: habits ?? [],
    groups: groups ?? [],
    stats: stats ?? [],
    entries: allEntries,
    dailySums: dailySums
  }
}

export default function Analytics() {
  const loaderData = useLoaderData() as any
  const [groupFilter, setGroupFilter] = useState<string>('all')

  if (!loaderData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const { habits, groups, stats, entries, dailySums } = loaderData

  // Filter habits based on selected group
  const filteredHabits = useMemo(() => {
    if (groupFilter === 'all') {
      return habits.filter((h: Habit) => h.status === 'active' && !h.is_archived)
    } else if (groupFilter === 'ungrouped') {
      return habits.filter((h: Habit) => 
        h.status === 'active' && !h.is_archived && !h.group_id
      )
    } else {
      return habits.filter((h: Habit) => 
        h.status === 'active' && !h.is_archived && h.group_id === groupFilter
      )
    }
  }, [habits, groupFilter])

  // Filter stats based on filtered habits
  const filteredStats = useMemo(() => {
    const filteredHabitIds = new Set(filteredHabits.map((h: Habit) => h.id))
    return stats.filter((stat: DashboardHabit) => filteredHabitIds.has(stat.habit_id))
  }, [stats, filteredHabits])

  // Filter entries based on filtered habits
  const filteredEntries = useMemo(() => {
    const filteredHabitIds = new Set(filteredHabits.map((h: Habit) => h.id))
    return entries
      .map((habitEntries: any[], idx: number) => 
        filteredHabitIds.has(habits[idx]?.id) ? habitEntries : []
      )
      .flat()
  }, [entries, filteredHabits, habits])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalActive = filteredHabits.length
    const habitsWithEntriesToday = dailySums
      .filter((ds: { id: string; value: number }) => 
        filteredHabits.some((h: Habit) => h.id === ds.id) && ds.value > 0
      ).length
    const todayCompletionRate = totalActive > 0 
      ? Math.round((habitsWithEntriesToday / totalActive) * 100) 
      : 0

    const longestStreak = filteredStats.length > 0
      ? Math.max(...filteredStats.map((s: DashboardHabit) => s.longest_streak ?? 0))
      : 0

    const currentLongestStreak = filteredStats.length > 0
      ? Math.max(...filteredStats.map((s: DashboardHabit) => s.current_streak ?? 0))
      : 0

    const weekAgo = new TZDate()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekEntries = filteredEntries.filter((entry: any) => {
      const entryDate = new TZDate(entry.entry_date)
      return entryDate >= weekAgo
    }).length

    const avgCompletionRate = filteredStats.length > 0
      ? Math.round(filteredStats.reduce((sum: number, s: DashboardHabit) => 
          sum + (s.week_completion ?? 0), 0) / filteredStats.length)
      : 0

    const totalEntries = filteredEntries.length
    const monthAgo = new TZDate()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const monthEntries = filteredEntries.filter((entry: any) => {
      const entryDate = new TZDate(entry.entry_date)
      return entryDate >= monthAgo
    }).length

    return {
      totalActive,
      todayCompletionRate,
      longestStreak,
      currentLongestStreak,
      weekEntries,
      avgCompletionRate,
      totalEntries,
      monthEntries
    }
  }, [filteredHabits, dailySums, filteredStats, filteredEntries])

  // Daily trend data (last 30 days)
  const dailyTrendData = useMemo(() => {
    const days = 30
    const data: { date: string; entries: number; value: number }[] = []
    const today = new TZDate()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new TZDate(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayEntries = filteredEntries.filter((entry: any) => 
        entry.entry_date?.startsWith(dateStr)
      )
      
      data.push({
        date: dateStr,
        entries: dayEntries.length,
        value: dayEntries.reduce((sum: number, e: any) => sum + (e.value || 0), 0)
      })
    }
    
    return data
  }, [filteredEntries])

  // Weekly completion rate data
  const weeklyCompletionData = useMemo(() => {
    const weeks = 8
    const data: { week: string; completion: number }[] = []
    const today = new TZDate()
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new TZDate(today)
      weekStart.setDate(weekStart.getDate() - (i * 7) - (weekStart.getDay() || 7) + 1)
      const weekEnd = new TZDate(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekEntries = filteredEntries.filter((entry: any) => {
        const entryDate = new TZDate(entry.entry_date)
        return entryDate >= weekStart && entryDate <= weekEnd
      })
      
      const uniqueDays = new Set(
        weekEntries.map((e: any) => e.entry_date?.split('T')[0])
      ).size
      
      data.push({
        week: `Week ${weeks - i}`,
        completion: uniqueDays
      })
    }
    
    return data
  }, [filteredEntries])

  // Group performance data
  const groupPerformanceData = useMemo(() => {
    const groupMap = new Map<string, { name: string; habits: number; avgStreak: number; completion: number }>()
    
    // Add ungrouped
    const ungroupedHabits = filteredHabits.filter((h: Habit) => !h.group_id)
    if (ungroupedHabits.length > 0) {
      const ungroupedStats = filteredStats.filter((s: DashboardHabit) =>
        ungroupedHabits.some((h: Habit) => h.id === s.habit_id)
      )
      const avgStreak = ungroupedStats.length > 0
        ? ungroupedStats.reduce((sum: number, s: DashboardHabit) => sum + (s.current_streak ?? 0), 0) / ungroupedStats.length
        : 0
      const avgCompletion = ungroupedStats.length > 0
        ? ungroupedStats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / ungroupedStats.length
        : 0
      
      groupMap.set('ungrouped', {
        name: 'Ungrouped',
        habits: ungroupedHabits.length,
        avgStreak: Math.round(avgStreak),
        completion: Math.round(avgCompletion)
      })
    }
    
    // Add grouped habits
    groups.forEach((group: HabitGroup) => {
      const groupHabits = filteredHabits.filter((h: Habit) => h.group_id === group.id)
      if (groupHabits.length > 0) {
        const groupStats = filteredStats.filter((s: DashboardHabit) =>
          groupHabits.some((h: Habit) => h.id === s.habit_id)
        )
        const avgStreak = groupStats.length > 0
          ? groupStats.reduce((sum: number, s: DashboardHabit) => sum + (s.current_streak ?? 0), 0) / groupStats.length
          : 0
        const avgCompletion = groupStats.length > 0
          ? groupStats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / groupStats.length
          : 0
        
        groupMap.set(group.id, {
          name: group.name,
          habits: groupHabits.length,
          avgStreak: Math.round(avgStreak),
          completion: Math.round(avgCompletion)
        })
      }
    })
    
    return Array.from(groupMap.values())
  }, [filteredHabits, groups, filteredStats])

  // Top performing habits
  const topPerformers = useMemo(() => {
    return [...filteredStats]
      .sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))
      .slice(0, 5)
  }, [filteredStats])

  // Habit distribution by group (pie chart data)
  const habitDistributionData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = []
    
    const ungroupedCount = filteredHabits.filter((h: Habit) => !h.group_id).length
    if (ungroupedCount > 0) {
      data.push({ name: 'Ungrouped', value: ungroupedCount, color: 'var(--chart-1)' })
    }
    
    groups.forEach((group: HabitGroup, idx: number) => {
      const count = filteredHabits.filter((h: Habit) => h.group_id === group.id).length
      if (count > 0) {
        const colors = [
          'var(--chart-2)',
          'var(--chart-3)',
          'var(--chart-4)',
          'var(--chart-5)',
          'var(--chart-1)'
        ]
        data.push({
          name: group.name,
          value: count,
          color: colors[idx % colors.length]
        })
      }
    })
    
    return data
  }, [filteredHabits, groups])

  const chartConfig = {
    entries: {
      label: "Entries",
      color: "var(--chart-1)",
    },
    value: {
      label: "Total Value",
      color: "var(--chart-2)",
    },
    completion: {
      label: "Completion",
      color: "var(--chart-3)",
    },
    avgStreak: {
      label: "Avg Streak",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  const pieChartConfig = {
    value: {
      label: "Habits",
    },
  } satisfies ChartConfig

  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ]

  const selectedGroupName = groupFilter === 'all' 
    ? 'All Groups' 
    : groupFilter === 'ungrouped'
    ? 'Ungrouped'
    : groups.find((g: HabitGroup) => g.id === groupFilter)?.name || 'All Groups'

  return (
    <div className="relative h-full flex flex-1 flex-col gap-6 p-2 sm:p-4 pt-0 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="md:min-h-min">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Analytics Dashboard</h4>
            <p className="text-muted-foreground text-sm">
              Comprehensive insights into your habit tracking and progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="ungrouped">Ungrouped</SelectItem>
                {groups.map((group: HabitGroup) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="my-4" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalActive}</div>
              <p className="text-xs text-muted-foreground">
                {selectedGroupName}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.todayCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Habits completed today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.currentLongestStreak}</div>
              <p className="text-xs text-muted-foreground">
                Longest active streak
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.weekEntries}</div>
              <p className="text-xs text-muted-foreground">
                Total entries logged
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 w-full">
        {/* Daily Trend Chart */}
        {dailyTrendData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full min-w-0 max-w-full"
          >
            <Card className="w-full overflow-hidden max-w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Daily Activity Trend</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Entries and values over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="px-1 sm:px-6">
                <ChartContainer config={chartConfig} className="w-full aspect-[4/3] sm:aspect-video min-w-0">
                  <AreaChart data={dailyTrendData} margin={{ top: 5, right: 5, left: -10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                      minTickGap={20}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString()
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="entries"
                      stroke="var(--color-entries)"
                      fill="var(--color-entries)"
                      fillOpacity={0.6}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      fill="var(--color-value)"
                      fillOpacity={0.6}
                      stackId="2"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weekly Completion Chart */}
        {weeklyCompletionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full min-w-0 max-w-full"
          >
            <Card className="w-full overflow-hidden max-w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Weekly Completion</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Active days per week over the last 8 weeks
                </CardDescription>
              </CardHeader>
              <CardContent className="px-1 sm:px-6">
                <ChartContainer config={chartConfig} className="w-full aspect-[4/3] sm:aspect-video min-w-0">
                  <BarChart data={weeklyCompletionData} margin={{ top: 5, right: 5, left: -10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completion" fill="var(--color-completion)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Group Performance and Distribution */}
      <div className="grid gap-4 md:grid-cols-2 w-full">
        {/* Group Performance Comparison */}
        {groupPerformanceData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full min-w-0 max-w-full"
          >
            <Card className="w-full overflow-hidden max-w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Group Performance</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Average streaks and completion rates by group
                </CardDescription>
              </CardHeader>
              <CardContent className="px-1 sm:px-6">
                <ChartContainer config={chartConfig} className="w-full aspect-[4/3] sm:aspect-video min-w-0">
                  <BarChart data={groupPerformanceData} margin={{ top: 5, right: 5, left: -10, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                    <Bar dataKey="avgStreak" fill="var(--color-avgStreak)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completion" fill="var(--color-completion)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Habit Distribution Pie Chart */}
        {habitDistributionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="w-full min-w-0 max-w-full"
          >
            <Card className="w-full overflow-hidden max-w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Habit Distribution</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Habits grouped by category
                </CardDescription>
              </CardHeader>
              <CardContent className="px-1 sm:px-6">
                <ChartContainer config={pieChartConfig} className="w-full aspect-square max-w-full min-w-0">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={habitDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="65%"
                      label={({ name, percent }) => {
                        // Show simplified labels on mobile
                        return `${name}: ${(percent * 100).toFixed(0)}%`
                      }}
                      labelLine={false}
                    >
                      {habitDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Habits
              </CardTitle>
              <CardDescription>
                Your most consistent habits ranked by current streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPerformers.map((stat: DashboardHabit, idx: number) => (
                  <div
                    key={stat.habit_id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-base flex-shrink-0 ${
                        idx === 0 ? 'bg-primary text-primary-foreground' :
                        idx === 1 ? 'bg-accent text-accent-foreground' :
                        idx === 2 ? 'bg-chart-4 text-white' :
                        'bg-secondary text-secondary-foreground'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium capitalize text-sm sm:text-base truncate">{stat.habit_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Longest: {stat.longest_streak} days • Week: {Math.round(stat.week_completion ?? 0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-base sm:text-lg">{stat.current_streak}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                      <Flame className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.current_streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredHabits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Habits</h3>
            <p className="text-muted-foreground text-center mb-4">
              {groupFilter === 'all' 
                ? 'Start tracking your habits to see analytics and insights here.'
                : 'No habits found in this group. Try selecting a different group or create new habits.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

