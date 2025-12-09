import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Separator } from "../components/ui/separator"
import { type Habit, type HabitGroup } from '../components/Tables/Habits/columns'
import { Button } from '../components/ui/button'
import { Forward, Plus, CheckCircle2, Flame, Target, Minus, Edit2, Folder, FolderOpen } from 'lucide-react'
import { addHabitEntry, getHabitGroupsByUserId, getHabitsByUserIdWithGroups } from '../api/supabase'
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

    const habits: Habit[] = await getHabitsByUserIdWithGroups(user.id);
    const groups: HabitGroup[] = await getHabitGroupsByUserId(user.id);
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

    return {user: user, habits: habits ?? [], groups: groups ?? [], stats: data ?? [], dailySums: dailySums};
}

export default function home({ loaderData }: any) {
  const user = loaderData.user;
  const [update, setUpdate] = useState(false);
  const [habit, selectHabit] = useState<string>('');
  const [value, selectValue] = useState<number>(0);
  const [data, setData] = useState<Habit[] | []>(loaderData.habits ?? [])
  const [groups, setGroups] = useState<HabitGroup[]>(loaderData.groups ?? [])
  const [dailySums, setDailySums] = useState<{ id: string; value: number }[]>(loaderData.dailySums ?? []);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  const activeHabits = useMemo(() => {
    return data.filter((h: Habit) => h.status === 'active' && !h.is_archived);
  }, [data]);

  // Group habits by their group_id
  const habitsByGroup = useMemo(() => {
    const grouped: Record<string, Habit[]> = {};
    const ungrouped: Habit[] = [];

    activeHabits.forEach(habit => {
      if (habit.group_id) {
        if (!grouped[habit.group_id]) {
          grouped[habit.group_id] = [];
        }
        grouped[habit.group_id].push(habit);
      } else {
        ungrouped.push(habit);
      }
    });

    return { grouped, ungrouped };
  }, [activeHabits]);

  // Calculate group statistics
  const groupStats = useMemo(() => {
    return groups.map(group => {
      const groupHabits = habitsByGroup.grouped[group.id] || [];
      const totalHabits = groupHabits.length;
      
      if (totalHabits === 0) {
        return {
          groupId: group.id,
          totalHabits: 0,
          completedToday: 0,
          completionRate: 0,
          totalStreak: 0,
          avgStreak: 0,
          totalProgress: 0,
          avgProgress: 0
        };
      }

      const completedToday = groupHabits.filter(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
        return (sum?.value ?? 0) > 0;
      }).length;

      const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

      const stats = loaderData.stats ?? [];
      const groupStatsData = groupHabits.map(habit => 
        stats.find((s: DashboardHabit) => s.habit_id === habit.id)
      ).filter(Boolean) as DashboardHabit[];

      const totalStreak = groupStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0);
      const avgStreak = groupStatsData.length > 0 ? Math.round(totalStreak / groupStatsData.length) : 0;

      // Calculate progress (how close habits are to their goals)
      const progressData = groupHabits.map(habit => {
        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
        const currentValue = sum?.value ?? 0;
        const goal = habit.goal ?? 1;
        return Math.min((currentValue / goal) * 100, 100);
      });
      const totalProgress = progressData.reduce((sum, p) => sum + p, 0);
      const avgProgress = progressData.length > 0 ? Math.round(totalProgress / progressData.length) : 0;

      return {
        groupId: group.id,
        totalHabits,
        completedToday,
        completionRate,
        totalStreak,
        avgStreak,
        totalProgress,
        avgProgress
      };
    });
  }, [groups, habitsByGroup, dailySums, loaderData.stats]);

  // Ungrouped habits stats
  const ungroupedStats = useMemo(() => {
    const ungroupedHabits = habitsByGroup.ungrouped;
    if (ungroupedHabits.length === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        avgStreak: 0,
        avgProgress: 0
      };
    }

    const completedToday = ungroupedHabits.filter(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
      return (sum?.value ?? 0) > 0;
    }).length;

    const completionRate = Math.round((completedToday / ungroupedHabits.length) * 100);

    const stats = loaderData.stats ?? [];
    const ungroupedStatsData = ungroupedHabits.map(habit => 
      stats.find((s: DashboardHabit) => s.habit_id === habit.id)
    ).filter(Boolean) as DashboardHabit[];

    const totalStreak = ungroupedStatsData.reduce((sum, s) => sum + (s.current_streak ?? 0), 0);
    const avgStreak = ungroupedStatsData.length > 0 ? Math.round(totalStreak / ungroupedStatsData.length) : 0;

    const progressData = ungroupedHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
      const currentValue = sum?.value ?? 0;
      const goal = habit.goal ?? 1;
      return Math.min((currentValue / goal) * 100, 100);
    });
    const totalProgress = progressData.reduce((sum, p) => sum + p, 0);
    const avgProgress = progressData.length > 0 ? Math.round(totalProgress / progressData.length) : 0;

    return {
      totalHabits: ungroupedHabits.length,
      completedToday,
      completionRate,
      avgStreak,
      avgProgress
    };
  }, [habitsByGroup.ungrouped, dailySums, loaderData.stats]);

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

    // Calculate streak statistics
    const streaks = stats.map((s: DashboardHabit) => s.current_streak ?? 0);
    const activeStreaks = streaks.filter((s: number) => s > 0);
    const avgStreak = activeStreaks.length > 0
      ? Math.round(activeStreaks.reduce((sum: number, s: number) => sum + s, 0) / activeStreaks.length)
      : 0;
    const totalStreakDays = streaks.reduce((sum: number, s: number) => sum + s, 0);
    const habitsWithStreaks = activeStreaks.length;
    const bestStreakEver = stats.length > 0
      ? Math.max(...stats.map((s: DashboardHabit) => s.longest_streak ?? 0))
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

    // Calculate progress metrics
    const progressData = activeHabits.map(habit => {
      const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
      const currentValue = sum?.value ?? 0;
      const goal = habit.goal ?? 1;
      return {
        habitId: habit.id,
        currentValue,
        goal,
        progress: Math.min((currentValue / goal) * 100, 100),
        isCompleted: currentValue >= goal
      };
    });

    const habitsAtGoal = progressData.filter(p => p.isCompleted).length;
    const avgProgress = progressData.length > 0
      ? Math.round(progressData.reduce((sum: number, p) => sum + p.progress, 0) / progressData.length)
      : 0;
    const totalGoalValue = progressData.reduce((sum: number, p) => sum + p.goal, 0);
    const totalCurrentValue = progressData.reduce((sum: number, p) => sum + p.currentValue, 0);
    const overallProgress = totalGoalValue > 0
      ? Math.round((totalCurrentValue / totalGoalValue) * 100)
      : 0;

    return {
      completed: habitsWithEntriesToday,
      total: totalActive,
      remaining: remaining,
      completionRate: todayCompletionRate,
      currentStreak: currentLongestStreak,
      avgStreak: avgStreak,
      totalStreakDays: totalStreakDays,
      habitsWithStreaks: habitsWithStreaks,
      bestStreakEver: bestStreakEver,
      totalEntries: totalEntriesToday,
      atRisk: atRisk,
      notStarted: notStarted,
      weekCompletion: weekCompletion,
      habitsAtGoal: habitsAtGoal,
      avgProgress: avgProgress,
      overallProgress: overallProgress,
      totalGoalValue: totalGoalValue,
      totalCurrentValue: totalCurrentValue
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
      const res = await getHabitsByUserIdWithGroups(user.id);
      setData(res);
      const groupsRes = await getHabitGroupsByUserId(user.id);
      setGroups(groupsRes);
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
    const res = await getHabitsByUserIdWithGroups(user.id);
    setData(res);
    const groupsRes = await getHabitGroupsByUserId(user.id);
    setGroups(groupsRes);
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
      const res = await getHabitsByUserIdWithGroups(user.id);
      setData(res);
      const groupsRes = await getHabitGroupsByUserId(user.id);
      setGroups(groupsRes);
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
      const res = await getHabitsByUserIdWithGroups(user.id);
      setData(res);
      const groupsRes = await getHabitGroupsByUserId(user.id);
      setGroups(groupsRes);
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
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))'
        }}
      >
        {/* Today's Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/dashboard">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{todayStats.completionRate}%</div>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayStats.completed} of {todayStats.total} habits logged
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">At goal</span>
                    <span className="font-medium text-primary">{todayStats.habitsAtGoal} habit{todayStats.habitsAtGoal !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg progress</span>
                    <span className="font-medium">{todayStats.avgProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total entries</span>
                    <span className="font-medium">{todayStats.totalEntries}</span>
                  </div>
                  {todayStats.remaining > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1 border-t">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{todayStats.remaining}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Habits Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link to="/dashboard/habits">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{todayStats.total}</div>
                  <span className="text-xs text-muted-foreground">habits</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently being tracked
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Logged today</span>
                    <span className="font-medium text-primary">{todayStats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reached goal</span>
                    <span className="font-medium">{todayStats.habitsAtGoal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">This week</span>
                    <span className="font-medium">{todayStats.weekCompletion}%</span>
                  </div>
                  {(todayStats.atRisk > 0 || todayStats.notStarted > 0) && (
                    <div className="pt-1 border-t space-y-1">
                      {todayStats.atRisk > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">At risk</span>
                          <span className="font-medium text-orange-500">{todayStats.atRisk}</span>
                        </div>
                      )}
                      {todayStats.notStarted > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Not started</span>
                          <span className="font-medium">{todayStats.notStarted}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Link to="/dashboard/analytics">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak Performance</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{todayStats.currentStreak}</div>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Longest active streak
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average streak</span>
                    <span className="font-medium flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {todayStats.avgStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active streaks</span>
                    <span className="font-medium">{todayStats.habitsWithStreaks} habits</span>
                  </div>
                  {todayStats.bestStreakEver > todayStats.currentStreak && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best ever</span>
                      <span className="font-medium text-primary">{todayStats.bestStreakEver} days</span>
                    </div>
                  )}
                  {todayStats.atRisk > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1 border-t">
                      <span className="text-muted-foreground">At risk</span>
                      <span className="font-medium text-orange-500">{todayStats.atRisk} streak{todayStats.atRisk !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your habits and view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                onClick={() => setUpdate(!update)}
                className="h-8 px-3 flex items-center gap-1.5 flex-1 sm:flex-initial"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Log Entry</span>
              </Button>
              <Link to="/dashboard/habits" className="flex-1 sm:flex-initial">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">View All</span>
                </Button>
              </Link>
              <Link to="/dashboard/analytics" className="flex-1 sm:flex-initial">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <Forward className="h-3.5 w-3.5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </Link>
              </div>
            </div>
          </CardContent>
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

      {/* Habit Groups Section */}
      {groups.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Habit Groups</h3>
              <p className="text-sm text-muted-foreground">Track your habits organized by groups</p>
            </div>
            <Link to="/dashboard/habits">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Manage Groups
                <Folder className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
            }}
          >
            {groups.map((group) => {
              const stats = groupStats.find(s => s.groupId === group.id);
              const groupHabits = habitsByGroup.grouped[group.id] || [];
              const isExpanded = expandedGroups.has(group.id);

              if (!stats || stats.totalHabits === 0) return null;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      const newExpanded = new Set(expandedGroups);
                      if (isExpanded) {
                        newExpanded.delete(group.id);
                      } else {
                        newExpanded.add(group.id);
                      }
                      setExpandedGroups(newExpanded);
                    }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {group.color && (
                          <div 
                            className="h-3 w-3 rounded-full shrink-0" 
                            style={{ backgroundColor: group.color }}
                          />
                        )}
                        <CardTitle className="text-sm font-medium capitalize truncate">{group.name}</CardTitle>
                      </div>
                      {isExpanded ? (
                        <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.completionRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.completedToday} of {stats.totalHabits} habits completed
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total habits</span>
                          <span className="font-medium">{stats.totalHabits}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg streak</span>
                          <span className="font-medium">{stats.avgStreak} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg progress</span>
                          <span className="font-medium">{stats.avgProgress}%</span>
                        </div>
                      </div>

                      {/* Expanded View - Show Habits in Group */}
                      {isExpanded && groupHabits.length > 0 && (
                        <div className="pt-3 border-t space-y-2 mt-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Habits in this group:
                          </div>
                          {groupHabits.slice(0, 3).map((habit) => {
                            const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id);
                            const currentValue = sum?.value ?? 0;
                            const progress = habit.goal 
                              ? Math.min((currentValue / habit.goal) * 100, 100)
                              : 0;
                            const isCompleted = currentValue > 0;

                            return (
                              <Link
                                key={habit.id}
                                to={`/dashboard/habits/${habit.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block"
                              >
                                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                    ) : (
                                      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground shrink-0" />
                                    )}
                                    <span className="text-xs font-medium capitalize truncate">{habit.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-muted-foreground">
                                      {currentValue}/{habit.goal}
                                    </span>
                                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          progress >= 100 ? 'bg-primary' :
                                          progress >= 50 ? 'bg-accent' :
                                          'bg-muted-foreground'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                          {groupHabits.length > 3 && (
                            <Link
                              to="/dashboard/habits"
                              onClick={(e) => e.stopPropagation()}
                              className="block text-xs text-center text-primary hover:underline pt-1"
                            >
                              View all {groupHabits.length} habits →
                            </Link>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ungrouped Habits Section */}
      {habitsByGroup.ungrouped.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ungrouped Habits</h3>
              <p className="text-sm text-muted-foreground">
                {habitsByGroup.ungrouped.length} habit{habitsByGroup.ungrouped.length !== 1 ? 's' : ''} not in a group
              </p>
            </div>
            <Link to="/dashboard/habits">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Organize Habits
                <Folder className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div 
                className="grid gap-4"
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
      )}

      {/* Today's Progress - Habit Cards */}
      {activeHabits.length > 0 ? (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Today's Habits</h3>
              <p className="text-sm text-muted-foreground">Quick access to log your daily progress</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <CSVImporter habits={data} />
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
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {activeHabits.map((habit: Habit) => {
                const backendValue = dailySums.find((s: { id: string; value: number }) => s.id === habit.id);
                const currentValue = backendValue?.value ?? 0;
                const progress = habit.goal 
                  ? Math.min((currentValue / habit.goal) * 100, 100)
                  : 0;
                const habitStats = loaderData.stats?.find((s: DashboardHabit) => s.habit_id === habit.id);
                const streak = habitStats?.current_streak ?? 0;
                const isCompleted = progress >= 100;
                
                return (
                  <CarouselItem 
                    key={habit.id} 
                    className="pl-2 md:pl-4 basis-full"
                    style={{
                      minWidth: 'min(100%, 320px)',
                      flex: '0 0 min(100%, 320px)'
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`w-full h-full flex flex-col hover:shadow-lg transition-all duration-200 ${
                        isCompleted ? 'border-primary/20 bg-primary/5' : ''
                      }`}>
                        <CardHeader className="pb-3 space-y-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              {habit.group_id && (() => {
                                const group = groups.find(g => g.id === habit.group_id);
                                return group && group.color ? (
                                  <div 
                                    className="h-3.5 w-3.5 rounded-full shrink-0 mt-1.5 ring-2 ring-background" 
                                    style={{ backgroundColor: group.color }}
                                  />
                                ) : null;
                              })()}
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold capitalize truncate leading-tight">
                                  {habit.name}
                                </CardTitle>
                                {habit.description && (
                                  <CardDescription className="text-xs mt-1 line-clamp-2 leading-relaxed">
                                    {habit.description}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                            <Link to={`/dashboard/habits/${habit.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 shrink-0 hover:bg-accent"
                              >
                                <Forward className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                          {/* Progress Section */}
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="flex items-baseline gap-1.5">
                                <span className={`text-3xl font-bold ${
                                  isCompleted ? 'text-primary' : ''
                                }`}>
                                  {currentValue}
                                </span>
                                <span className="text-lg text-muted-foreground font-medium">
                                  / {habit.goal}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  {habit.unit}
                                </span>
                              </div>
                              {isCompleted && (
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1.5">
                              <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                  className={`h-full rounded-full transition-colors ${
                                    progress >= 100 ? 'bg-primary' :
                                    progress >= 75 ? 'bg-green-500' :
                                    progress >= 50 ? 'bg-accent' :
                                    progress >= 25 ? 'bg-yellow-500' :
                                    'bg-muted-foreground'
                                  }`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {Math.round(progress)}% complete
                                </span>
                                {streak > 0 && (
                                  <div className="flex items-center gap-1 text-orange-500 font-medium">
                                    <Flame className="h-3.5 w-3.5" />
                                    <span>{streak} day{streak !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Update Controls */}
                          <div className="pt-4 mt-auto border-t">
                            <div className="flex items-center gap-2.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 shrink-0 hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
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

                              <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 px-2 py-1.5 rounded-md bg-secondary/30">
                                <span className="text-lg font-semibold tabular-nums">{currentValue}</span>
                                <span className="text-sm text-muted-foreground">/</span>
                                <span className="text-sm text-muted-foreground">{habit.goal}</span>
                                <span className="text-xs text-muted-foreground ml-1 truncate">{habit.unit}</span>
                              </div>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 shrink-0 hover:bg-primary/10 hover:border-primary/50 transition-colors"
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
                                    className="h-10 w-10 shrink-0 hover:bg-accent transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor={`edit-${habit.id}`} className="text-sm font-semibold">
                                        Update {habit.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground mt-1.5">
                                        Enter the total value for today
                                      </p>
                                    </div>
                                    <div className="space-y-3">
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
                                        <span className="text-sm text-muted-foreground font-medium min-w-12">
                                          {habit.unit}
                                        </span>
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
