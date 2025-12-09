import { useMemo } from 'react'
import { Separator } from "../components/ui/separator"
import { type Habit } from '../components/Tables/Habits/columns'
import { Button } from '../components/ui/button'
import { 
  TrendingUp,
  Target,
  Flame,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { getHabitsByUserId, fetchHabitEntriesFor } from '../api/supabase'
import { motion } from 'framer-motion'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { supabase } from '../api/client/client'
import { Link } from 'react-router'
import { TZDate } from '@date-fns/tz'
import { ChartAreaInteractive } from '../components/ChartAreaInteractive'
import { WeeklyWorkoutFrequencyChart } from '../components/Charts/WeeklyWorkoutFrequencyChart'
import { ConsistencyStreaksChart } from '../components/Charts/ConsistencyStreaksChart'
import type { DashboardHabit } from '../features/overview/table'

export const today = new TZDate().toISOString().split('T')[0];

export function formatHabitDate(habitDate: string) {
  const date = new TZDate(habitDate)
  const now = new TZDate()
  const startOfToday = new TZDate(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new TZDate(date.getFullYear(), date.getMonth(), date.getDate())

  const diffMs = startOfToday.getTime() - startOfTarget.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleString()
}

export async function clientLoader() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const habits: Habit[] = await getHabitsByUserId(user.id);
  const { data: stats } = await supabase.rpc('get_habit_dashboard_stats', { 
    p_user_id: user.id 
  });

  // Fetch entries for all habits to calculate trends
  const entriesPromises = habits.map(habit => 
    fetchHabitEntriesFor(user.id, habit.id)
  );
  const allEntries = await Promise.all(entriesPromises);

  // Get daily sums for today
  const dailySumsPromises = habits.map(habit =>
    supabase.rpc('get_daily_habit_sum', {
      p_user_id: user.id,
      p_habit_id: habit.id,
      p_date: today
    })
  );
  const dailySumsResults = await Promise.all(dailySumsPromises);
  const dailySums = habits.map((habit, idx) => ({
    id: habit.id,
    value: dailySumsResults[idx].data ?? 0,
  }));

  return {
    user: user, 
    habits: habits ?? [], 
    stats: stats ?? [],
    entries: allEntries,
    dailySums: dailySums
  };
}

export default function HomeAnalytics({ loaderData }: any) {
  if (!loaderData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const habits = loaderData?.habits ?? [];
  const stats = loaderData?.stats ?? [];
  const dailySums = loaderData?.dailySums ?? [];

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeHabits = habits.filter((h: Habit) => h.status === 'active' && !h.is_archived);
    const totalActive = activeHabits.length;
    
    // Today's completion rate
    const habitsWithEntriesToday = dailySums.filter((ds: { id: string; value: number }) => ds.value > 0).length;
    const todayCompletionRate = totalActive > 0 
      ? Math.round((habitsWithEntriesToday / totalActive) * 100) 
      : 0;

    // Longest streak across all habits
    const longestStreak = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.longest_streak ?? 0))
      : 0;

    // Current longest streak
    const currentLongestStreak = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.current_streak ?? 0))
      : 0;

    // Total entries this week
    const weekAgo = new TZDate();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = loaderData?.entries?.flat()?.filter((entry: any) => {
      const entryDate = new TZDate(entry.entry_date);
      return entryDate >= weekAgo;
    }).length ?? 0;

    // Average completion rate (based on week_completion from stats)
    const avgCompletionRate = stats.length > 0
      ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / stats.length)
      : 0;

    return {
      totalActive,
      todayCompletionRate,
      longestStreak,
      currentLongestStreak,
      weekEntries,
      avgCompletionRate
    };
  }, [habits, dailySums, stats, loaderData?.entries]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!loaderData?.entries) return [];
    
    const allEntries = loaderData.entries.flat();
    const entriesByDate: Record<string, number> = {};
    
    allEntries.forEach((entry: any) => {
      const date = entry.entry_date?.split('T')[0];
      if (date) {
        entriesByDate[date] = (entriesByDate[date] || 0) + entry.value;
      }
    });

    return Object.entries(entriesByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [loaderData?.entries]);

  // Weekly frequency data
  const weeklyData = useMemo(() => {
    if (!loaderData?.entries) return [];
    const allEntries = loaderData.entries.flat();
    return allEntries.map((entry: any) => entry.entry_date);
  }, [loaderData?.entries]);

  // Consistency chart data (dates with entries)
  const consistencyData = useMemo(() => {
    if (!loaderData?.entries) return [];
    const allEntries = loaderData.entries.flat();
    return allEntries.map((entry: any) => entry.entry_date?.split('T')[0]).filter(Boolean);
  }, [loaderData?.entries]);

  // Top performers
  const topPerformers = useMemo(() => {
    return [...stats]
      .sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))
      .slice(0, 3);
  }, [stats]);

  // Needs attention (habits with low completion or no entries today)
  const needsAttention = useMemo(() => {
    return stats.filter((stat: DashboardHabit) => {
      const hasEntryToday = dailySums.find((ds: { id: string; value: number }) => ds.id === stat.habit_id)?.value ?? 0;
      return (stat.current_streak ?? 0) === 0 || hasEntryToday === 0;
    }).slice(0, 3);
  }, [stats, dailySums]);

  return (
    <div className="relative h-full flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="md:min-h-min">
        <div className="space-y-1">
          <h4 className="text-sm leading-none font-medium">Analytics Dashboard</h4>
          <p className="text-muted-foreground text-sm">
            Comprehensive view of your habit tracking and progress.
          </p>
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
                Total habits being tracked
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ChartAreaInteractive chartData={chartData} />
          </motion.div>
        )}

        {/* Weekly Frequency */}
        {weeklyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Your habit completion frequency by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyWorkoutFrequencyChart workoutDates={weeklyData} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Consistency Heatmap */}
      {consistencyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Consistency Calendar</CardTitle>
              <CardDescription>
                Days you've logged entries this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsistencyStreaksChart workoutDates={consistencyData} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Performance Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Your most consistent habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((stat: DashboardHabit, idx: number) => (
                    <div key={stat.habit_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{stat.habit_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.current_streak} day streak
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{stat.current_streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Needs Attention
                </CardTitle>
                <CardDescription>
                  Habits that need your focus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {needsAttention.map((stat: DashboardHabit) => {
                    const hasEntryToday = dailySums.find((ds: { id: string; value: number }) => ds.id === stat.habit_id)?.value ?? 0;
                    return (
                      <div key={stat.habit_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium capitalize">{stat.habit_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {hasEntryToday === 0 ? 'No entry today' : 'Streak broken'}
                            </p>
                          </div>
                        </div>
                        <Link to={`/dashboard/habits/${stat.habit_id}`}>
                          <Button variant="outline" size="sm">
                            Log Entry
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Streak Leaderboard */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Streak Leaderboard
              </CardTitle>
              <CardDescription>
                All your habits ranked by current streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...stats]
                  .sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))
                  .map((stat: DashboardHabit, idx: number) => (
                    <div
                      key={stat.habit_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          idx === 0 ? 'bg-primary text-primary-foreground' :
                          idx === 1 ? 'bg-accent text-accent-foreground' :
                          idx === 2 ? 'bg-chart-4 text-white' :
                          'bg-secondary text-secondary-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <Link 
                            to={`/dashboard/habits/${stat.habit_id}`}
                            className="font-medium capitalize hover:underline"
                          >
                            {stat.habit_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Longest: {stat.longest_streak} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">{stat.current_streak}</p>
                          <p className="text-xs text-muted-foreground">days</p>
                        </div>
                        <Flame className={`h-5 w-5 ${stat.current_streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {habits.filter((h: Habit) => h.status === 'active' && !h.is_archived).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Habits</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your habits to see analytics and insights here.
            </p>
            <Link to="/dashboard/habits">
              <Button>
                Create Your First Habit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

