import { useState } from 'react'
import { addHabitEntry, getHabitsByUserIdWithGroups, getHabitGroupsByUserId } from '../api/supabase'
import { supabase } from '../api/client/client'
import { toast } from 'sonner'
import ReusableTable from '../features/overview/table'
import type { Habit, HabitGroup } from '../components/Tables/Habits/columns'
import {
  HomeHeader,
  TodaysProgressCard,
  ActiveHabitsCard,
  StreakPerformanceCard,
  WeeklyMonthlyStatsCard,
  QuickActionsCard,
  QuickEntryForm,
  HabitGroupsSection,
  UngroupedHabitsSection,
  TodaysHabitsCarousel,
  useHomeData,
  useHomeStats
} from '../components/Home'
import { today } from '../components/Home/utils'



export async function clientLoader() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const habits: Habit[] = await getHabitsByUserIdWithGroups(user.id);
    const groups: HabitGroup[] = await getHabitGroupsByUserId(user.id);
    const { data, error: statsError } = await supabase.rpc('get_habit_dashboard_stats', { 
      p_user_id: user.id 
    });
    
    if (statsError) {
      console.error('Failed to fetch dashboard stats in loader:', statsError);
    }

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
  const user = loaderData.user
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [stats, setStats] = useState<typeof loaderData.stats>(loaderData.stats ?? [])

  const {
    data,
    groups,
    dailySums,
    activeHabits,
    habitsByGroup,
    fetchData
  } = useHomeData(user?.id, loaderData)

  const { groupStats, ungroupedStats, todayStats } = useHomeStats(
    activeHabits,
    habitsByGroup,
    groups,
    dailySums,
    stats
  )

  const refreshStats = async () => {
    if (!user) return
    
    // Ensure we have a valid session before making the RPC call
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No active session found')
      return
    }
    
    const { data: newStats, error } = await supabase.rpc('get_habit_dashboard_stats', { 
      p_user_id: user.id 
    })
    
    if (error) {
      console.error('Failed to refresh stats:', error)
      // Don't update stats if there's an error
      return
    }
    
    // Force a new array reference to ensure React re-renders
    setStats(newStats ? [...newStats] : [])
  }

  const handleQuickEntrySubmit = async (habitId: string, value: number) => {
    if (!user) return

    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habitId,
        value: value,
        entry_date: today
      })
      
      toast.success("Successfully updated habit.")
      setShowQuickEntry(false)
      
      // Refresh data - fetchData already calls fetchAllSums internally
      await fetchData()
      await refreshStats()
    } catch (err) {
      console.error("Failed to add habit entry", err)
      toast.error("Failed to update habit. Please try again.")
    }
  }

  const handleQuickUpdate = async (habitId: string, increment: number) => {
    if (!user) return
    
    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habitId,
        value: increment,
        entry_date: today
      })
      
      toast.success(`Updated habit entry.`)
      
      // Refresh data - fetchData already calls fetchAllSums internally
      await fetchData()
      await refreshStats()
    } catch (err) {
      console.error("Failed to update habit entry", err)
      toast.error("Failed to update habit. Please try again.")
    }
  }

  const handleManualUpdate = async (habitId: string, value: number) => {
    if (!user || value < 0) return
    
    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habitId,
        value: value,
        entry_date: today
      })
      
      toast.success("Successfully updated habit.")
      
      // Refresh data - fetchData already calls fetchAllSums internally
      await fetchData()
      await refreshStats()
    } catch (err) {
      console.error("Failed to update habit entry", err)
      toast.error("Failed to update habit. Please try again.")
    }
  }

  return (
    <div className="relative h-full flex flex-1 flex-col gap-6 p-4 pt-0 overflow-x-hidden max-w-full">
      <HomeHeader />

      {/* Today's Summary Stats */}
      <div 
        className="grid gap-4 w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))'
        }}
      >
        <TodaysProgressCard
          completionRate={todayStats.completionRate}
          completed={todayStats.completed}
          total={todayStats.total}
          habitsAtGoal={todayStats.habitsAtGoal}
          avgProgress={todayStats.avgProgress}
          totalEntries={todayStats.totalEntries}
          remaining={todayStats.remaining}
        />
        <ActiveHabitsCard
          total={todayStats.total}
          completed={todayStats.completed}
          habitsAtGoal={todayStats.habitsAtGoal}
          weekCompletion={todayStats.weekCompletion}
          atRisk={todayStats.atRisk}
          notStarted={todayStats.notStarted}
        />
        <StreakPerformanceCard
          currentStreak={todayStats.currentStreak}
          avgStreak={todayStats.avgStreak}
          habitsWithStreaks={todayStats.habitsWithStreaks}
          bestStreakEver={todayStats.bestStreakEver}
          atRisk={todayStats.atRisk}
        />
        <WeeklyMonthlyStatsCard
          weeklyHabits={todayStats.weeklyHabits}
          monthlyHabits={todayStats.monthlyHabits}
        />
      </div>

      <QuickActionsCard onLogEntryClick={() => setShowQuickEntry(!showQuickEntry)} />

      <QuickEntryForm
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        onSubmit={handleQuickEntrySubmit}
      />

      <HabitGroupsSection
        groups={groups}
        groupStats={groupStats}
        habitsByGroup={habitsByGroup.grouped}
        dailySums={dailySums}
        stats={stats}
      />

      <UngroupedHabitsSection
        ungroupedCount={habitsByGroup.ungrouped.length}
        ungroupedStats={ungroupedStats}
      />

      <TodaysHabitsCarousel
        activeHabits={activeHabits}
        allHabits={data}
        dailySums={dailySums}
        stats={stats}
        groups={groups}
        onQuickUpdate={handleQuickUpdate}
        onManualUpdate={handleManualUpdate}
      />

      {/* Habit Overview Table */}
      {stats && stats.length > 0 && (
        <div className="w-full overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">All Habits Overview</h3>
          <ReusableTable data={stats} />
        </div>
      )}
    </div>
  )
}
