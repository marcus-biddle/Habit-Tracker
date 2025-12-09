import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Separator } from "../components/ui/separator"
import { type Habit } from '../components/Tables/Habits/columns'
import { Button } from '../components/ui/button'
import { Forward, Plus, CheckCircle2, Flame, Target, Minus, Edit2 } from 'lucide-react'
import { addHabitEntry, getHabitsByUserId } from '../api/supabase'
import { motion } from 'framer-motion'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Combobox } from '../components/ComboBox'
import { AlertDialogButton } from '../components/AlertDialogButton'
import { supabase } from '../api/client/client'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { TZDate } from '@date-fns/tz';
import { EmptyHabitState } from '../components/EmptyHabitState'
import { Carousel } from '../components/ui/carousel'
import { CarouselContent } from '../components/ui/carousel'
import { CarouselItem } from '../components/ui/carousel'
import { CircularProgress } from '../components/CircularProgressBar'
import ReusableTable from '../features/overview/table'
import CSVImporter from '../features/CSVImporter'
import type { DashboardHabit } from '../features/overview/table'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

export const fakeHabits: Habit[] = [
  {
    id: "a68f1e3f-9c4e-4a7d-b8fa-2f8dcb7a4a01",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "Drink Water",
    description: "Drink at least 8 glasses of water daily.",
    status: "active",
    unit: "glasses",
    frequency: "daily",
    goal: 8,
    reminder_time: "08:00:00",
    is_archived: false,
    created_at: "2025-11-01T07:30:00.000Z",
    updated_at: "2025-11-15T12:00:00.000Z",
  },
  {
    id: "f72e3b7c-8a7f-434d-91bc-8749f789fa4d",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "Morning Jog",
    description: null,
    status: "active",
    unit: "minutes",
    frequency: "daily",
    goal: 30,
    reminder_time: null,
    is_archived: false,
    created_at: "2025-10-25T06:00:00.000Z",
    updated_at: "2025-11-14T09:00:00.000Z",
  },
  {
    id: "c3f8bcf1-23a0-4174-ae29-425d6bc4c6b2",
    user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
    name: "Read Books",
    description: "Read for at least 20 minutes a day.",
    status: "inactive",
    unit: "minutes",
    frequency: "daily",
    goal: 20,
    reminder_time: "20:00:00",
    is_archived: false,
    created_at: "2025-09-10T21:00:00.000Z",
    updated_at: "2025-10-01T11:30:00.000Z",
  },
  {
    id: "7d120b8a-564d-44cb-9f39-70e1336cb78e",
    user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
    name: "Meditation",
    description: "Meditate daily to improve focus and reduce stress.",
    status: "active",
    unit: "minutes",
    frequency: "daily",
    goal: 15,
    reminder_time: "07:30:00",
    is_archived: false,
    created_at: "2025-11-10T06:00:00.000Z",
    updated_at: "2025-11-15T08:45:00.000Z",
  },
  {
    id: "6c1a7d9b-63a6-4a2b-9043-94d7e7b9c953",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "No Sugar",
    description: "Avoid sugary snacks and drinks.",
    status: "active",
    unit: "days",
    frequency: "weekly",
    goal: 7,
    reminder_time: null,
    is_archived: true,
    created_at: "2025-08-01T10:00:00.000Z",
    updated_at: "2025-09-01T15:00:00.000Z",
  },
];

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
    const { data } = await supabase.rpc('get_habit_dashboard_stats', { 
      p_user_id: user.id 
    });

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

    return {user: user, habits: habits ?? [], stats: data ?? [], dailySums: dailySums};
}

export default function home({ loaderData }: any) {
  const user = loaderData.user;
  const [update, setUpdate] = useState(false);
  const [habit, selectHabit] = useState<string>('');
  const [value, selectValue] = useState<number>(0);
  const [data, setData] = useState<Habit[] | []>(loaderData.habits ?? [])
  const [dailySums, setDailySums] = useState<{ id: string; value: number }[]>(loaderData.dailySums ?? []);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  const activeHabits = useMemo(() => {
    return data.filter((h: Habit) => h.status === 'active' && !h.is_archived);
  }, [data]);

  // Calculate today's summary stats
  const todayStats = useMemo(() => {
    const habitsWithEntriesToday = dailySums.filter((ds: { id: string; value: number }) => ds.value > 0).length;
    const totalActive = activeHabits.length;
    const todayCompletionRate = totalActive > 0 
      ? Math.round((habitsWithEntriesToday / totalActive) * 100) 
      : 0;
    const remaining = totalActive - habitsWithEntriesToday;

    const stats = loaderData.stats ?? [];
    const currentLongestStreak = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.current_streak ?? 0))
      : 0;

    // Calculate total entries today
    const totalEntriesToday = dailySums.reduce((sum: number, ds: { id: string; value: number }) => sum + ds.value, 0);

    // Calculate habits at risk (no entry today and streak > 0)
    const atRisk = stats.filter((s: DashboardHabit) => {
      const hasEntryToday = dailySums.find((ds: { id: string; value: number }) => ds.id === s.habit_id)?.value ?? 0;
      return hasEntryToday === 0 && (s.current_streak ?? 0) > 0;
    }).length;

    // Calculate habits not started today (no entry at all)
    const notStarted = totalActive - habitsWithEntriesToday;

    // Calculate week completion rate
    const weekCompletion = stats.length > 0
      ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.week_completion ?? 0), 0) / stats.length)
      : 0;

    return {
      completed: habitsWithEntriesToday,
      total: totalActive,
      remaining: remaining,
      completionRate: todayCompletionRate,
      currentStreak: currentLongestStreak,
      totalEntries: totalEntriesToday,
      atRisk: atRisk,
      notStarted: notStarted,
      weekCompletion: weekCompletion
    };
  }, [dailySums, activeHabits, loaderData.stats]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habit,
        value: value,
        entry_date: today
      });
      
      setUpdate(false);
      selectHabit('');
      selectValue(0);
      toast.success("Successfully updated habit.");
      
      // Refresh data
      const res = await getHabitsByUserId(user.id);
      setData(res);
      await fetchAllSums(res);
    } catch (err) {
      console.error("Failed to add habit entry", err);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  const fetchHabitDailySum = async (habitId: string) => {
    if (!user) return 0;

    const { data, error } = await supabase.rpc('get_daily_habit_sum', {
      p_user_id: user.id,
      p_habit_id: habitId,
      p_date: today
    });

    if (error) {
      console.error("RPC call failed:", error);
      return 0;
    }

    return data ?? 0;
  }

  const fetchAllSums = async (res: Habit[] | null) => {
    if (!res) return;

    const sums = await Promise.all(
      res.map(habit => fetchHabitDailySum(habit.id))
    );
    const newDailySums = res.map((habit, idx) => ({
      id: habit.id,
      value: sums[idx],
    }));

    setDailySums(newDailySums);
  };

  const fetchData = async() => {
    if (!user) return;
    const res = await getHabitsByUserId(user.id);
    setData(res);
    await fetchAllSums(res);
  }

  const handleQuickUpdate = async (habitId: string, increment: number) => {
    if (!user) return;
    
    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habitId,
        value: increment,
        entry_date: today
      });
      
      toast.success(`Updated habit entry.`);
      
      // Refresh data
      const res = await getHabitsByUserId(user.id);
      setData(res);
      await fetchAllSums(res);
    } catch (err) {
      console.error("Failed to update habit entry", err);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  const handleManualUpdate = async (habitId: string) => {
    if (!user || editValue < 0) return;
    
    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habitId,
        value: editValue,
        entry_date: today
      });
      
      toast.success("Successfully updated habit.");
      setEditingHabit(null);
      setEditValue(0);
      
      // Refresh data
      const res = await getHabitsByUserId(user.id);
      setData(res);
      await fetchAllSums(res);
    } catch (err) {
      console.error("Failed to update habit entry", err);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, update]);

  return (
    <div className="relative h-full flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="md:min-h-min">
        <div className="space-y-1">
          <h4 className="text-sm leading-none font-medium">Dashboard</h4>
          <p className="text-muted-foreground text-sm">
            Track your habits and log your daily progress.
          </p>
        </div>
        <Separator className="my-4" />
      </div>

      {/* Today's Summary Stats */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Status Card - Focus on what's done vs remaining */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Link to="/dashboard">
            <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Today's Status</CardTitle>
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="px-3 pb-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">{todayStats.completed}</span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-xl font-semibold">{todayStats.total}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${todayStats.completionRate}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          todayStats.completionRate >= 75 ? 'bg-primary' :
                          todayStats.completionRate >= 50 ? 'bg-accent' :
                          'bg-muted-foreground'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold min-w-10 text-right">
                      {todayStats.completionRate}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Remaining</span>
                    <span className="text-xs font-semibold">{todayStats.remaining}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">This week</span>
                    <span className="text-xs font-semibold">{todayStats.weekCompletion}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Habits Overview Card - Show status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="h-full"
        >
          <Link to="/dashboard/habits">
            <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Habits Overview</CardTitle>
                <Target className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="px-3 pb-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-bold">{todayStats.total}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {todayStats.total === 1 ? 'Active habit' : 'Active habits'}
                  </p>
                </div>
                <div className="space-y-1.5 mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-[10px] text-muted-foreground">Completed</span>
                    </div>
                    <span className="text-xs font-semibold">{todayStats.completed}</span>
                  </div>
                  {todayStats.atRisk > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-chart-4" />
                        <span className="text-[10px] text-muted-foreground">At risk</span>
                      </div>
                      <span className="text-xs font-semibold text-chart-4">{todayStats.atRisk}</span>
                    </div>
                  )}
                  {todayStats.notStarted > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Not started</span>
                      </div>
                      <span className="text-xs font-semibold">{todayStats.notStarted}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Streak & Momentum Card - Focus on maintaining momentum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="h-full"
        >
          <Link to="/dashboard/analytics">
            <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Streak & Momentum</CardTitle>
                <Flame className="h-3.5 w-3.5 text-chart-4" />
              </div>
              <div className="px-3 pb-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold">{todayStats.currentStreak}</span>
                    {todayStats.currentStreak > 0 && (
                      <Flame className="h-4 w-4 text-chart-4 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {todayStats.currentStreak === 0 
                      ? 'Start your streak today!' 
                      : todayStats.currentStreak === 1 
                      ? 'day streak - keep going!' 
                      : 'days streak - keep going!'}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-border/50">
                  {todayStats.atRisk > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Streaks at risk</span>
                      <span className="text-xs font-semibold text-chart-4">{todayStats.atRisk}</span>
                    </div>
                  ) : todayStats.currentStreak > 0 ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-muted-foreground">All streaks safe</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Log entries to build streaks</span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
          <div className="flex flex-row items-center justify-between px-4 py-2.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => setUpdate(!update)}
                className="h-8 px-3 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Log Entry</span>
              </Button>
              <Link to="/dashboard/habits">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">View All</span>
                </Button>
              </Link>
              <Link to="/dashboard/analytics">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5"
                >
                  <Forward className="h-3.5 w-3.5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Entry Form */}
      {update && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Log Habit Entry</CardTitle>
              <CardDescription>
                Select your habit and enter the value you completed today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="habit">Select Habit</Label>
                    <div className='relative w-full'>
                      <Combobox onSelect={selectHabit} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">How many units did you complete today?</Label>
                    <Input 
                      id="value" 
                      type="number" 
                      min={0} 
                      value={value || ''}
                      onChange={(e) => selectValue(Number(e.target.value) || 0)} 
                      required 
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex gap-2">
              <AlertDialogButton 
                buttonText='Save Entry' 
                type='submit' 
                onContinue={() => formRef.current?.requestSubmit()} 
                dialingDesc='This will add an entry for today.' 
              />
              <Button variant="outline" onClick={() => {
                setUpdate(false);
                selectHabit('');
                selectValue(0);
              }}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Today's Progress - Habit Cards */}
      {activeHabits.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Habits</h3>
            <div className="flex gap-2">
              <CSVImporter habits={data} />
              <Link to="/dashboard/analytics">
                <Button variant="outline" size="sm">
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
            className="w-full"
          >
            <CarouselContent className="p-3">
              {activeHabits.map((habit: Habit) => {
                const backendValue = dailySums.find((s: { id: string; value: number }) => s.id === habit.id);
                const currentValue = backendValue?.value ?? 0;
                const progress = habit.goal 
                  ? Math.min((currentValue / habit.goal) * 100, 100)
                  : 0;
                const habitStats = loaderData.stats?.find((s: DashboardHabit) => s.habit_id === habit.id);
                const streak = habitStats?.current_streak ?? 0;
                
                return (
                  <CarouselItem key={habit.id} className="basis-full lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`w-full transition-all hover:shadow-lg ${
                          progress >= 100 ? 'border-primary border-2' : 
                          progress >= 50 ? 'border-accent' : 
                          'border-border'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg capitalize mb-1">{habit.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {habit.description || `Goal: ${habit.goal} ${habit.unit} ${habit.frequency}`}
                              </CardDescription>
                            </div>
                            <Link to={`/dashboard/habits/${habit.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Forward className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Progress Display */}
                          <div className="flex items-center gap-4">
                            <div className="shrink-0">
                              <CircularProgress
                                value={currentValue}
                                goal={habit.goal ?? 1}
                                unit={habit.unit}
                                showGoal={false}
                                size={80}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.5 }}
                                  className={`h-2 rounded-full ${
                                    progress >= 100 ? 'bg-primary' :
                                    progress >= 50 ? 'bg-accent' :
                                    'bg-muted-foreground'
                                  }`}
                                />
                              </div>
                              {streak > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Flame className="h-3 w-3 text-chart-4" />
                                  <span>{streak} day{streak !== 1 ? 's' : ''} streak</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Update Controls */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickUpdate(habit.id, -1);
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Decrease by 1</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="flex-1 flex items-center justify-center gap-1">
                              <span className="text-lg font-semibold">{currentValue}</span>
                              <span className="text-sm text-muted-foreground">/ {habit.goal}</span>
                              <span className="text-xs text-muted-foreground ml-1">{habit.unit}</span>
                            </div>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickUpdate(habit.id, 1);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Increase by 1</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Popover open={editingHabit === habit.id} onOpenChange={(open) => {
                              if (!open) {
                                setEditingHabit(null);
                                setEditValue(0);
                              } else {
                                setEditingHabit(habit.id);
                                setEditValue(currentValue);
                              }
                            }}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64" onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor={`edit-${habit.id}`} className="text-sm font-medium">
                                      Update {habit.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Enter the total value for today
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id={`edit-${habit.id}`}
                                        type="number"
                                        min={0}
                                        value={editValue || ''}
                                        onChange={(e) => setEditValue(Number(e.target.value) || 0)}
                                        placeholder="Enter value"
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleManualUpdate(habit.id);
                                          }
                                        }}
                                      />
                                      <span className="text-sm text-muted-foreground">{habit.unit}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleManualUpdate(habit.id)}
                                      >
                                        Update
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                          setEditingHabit(null);
                                          setEditValue(0);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptyHabitState />
      )}

      {/* Habit Overview Table */}
      {loaderData.stats && loaderData.stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">All Habits Overview</h3>
          <ReusableTable data={loaderData.stats} />
        </div>
      )}
    </div>
  )
}
