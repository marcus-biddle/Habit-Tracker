import { useState, useEffect, useMemo } from 'react'
import { getHabitsByUserIdWithGroups, getHabitGroupsByUserId } from '../../../api/supabase'
import { supabase } from '../../../api/client/client'
import { today } from '../utils'
import type { Habit, HabitGroup } from '../../Tables/Habits/columns'

export function useHomeData(userId: string | undefined, initialData: any) {
  const [data, setData] = useState<Habit[]>(initialData.habits ?? [])
  const [groups, setGroups] = useState<HabitGroup[]>(initialData.groups ?? [])
  const [dailySums, setDailySums] = useState<{ id: string; value: number }[]>(initialData.dailySums ?? [])
  const [update, setUpdate] = useState(false)

  const activeHabits = useMemo(() => {
    return data.filter((h: Habit) => h.status === 'active' && !h.is_archived)
  }, [data])

  const habitsByGroup = useMemo(() => {
    const grouped: Record<string, Habit[]> = {}
    const ungrouped: Habit[] = []

    activeHabits.forEach(habit => {
      if (habit.group_id) {
        if (!grouped[habit.group_id]) {
          grouped[habit.group_id] = []
        }
        grouped[habit.group_id].push(habit)
      } else {
        ungrouped.push(habit)
      }
    })

    return { grouped, ungrouped }
  }, [activeHabits])

  const fetchHabitDailySum = async (habitId: string) => {
    if (!userId) return 0

    const { data, error } = await supabase.rpc('get_daily_habit_sum', {
      p_user_id: userId,
      p_habit_id: habitId,
      p_date: today
    })

    if (error) {
      console.error("RPC call failed:", error)
      return 0
    }

    return data ?? 0
  }

  const fetchAllSums = async (res: Habit[] | null) => {
    if (!res) return

    const sums = await Promise.all(
      res.map(habit => fetchHabitDailySum(habit.id))
    )
    const newDailySums = res.map((habit, idx) => ({
      id: habit.id,
      value: sums[idx],
    }))

    setDailySums(newDailySums)
  }

  const fetchData = async () => {
    if (!userId) return
    const res = await getHabitsByUserIdWithGroups(userId)
    setData(res)
    const groupsRes = await getHabitGroupsByUserId(userId)
    setGroups(groupsRes)
    await fetchAllSums(res)
  }

  useEffect(() => {
    fetchData()
  }, [userId, update])

  return {
    data,
    setData,
    groups,
    setGroups,
    dailySums,
    setDailySums,
    activeHabits,
    habitsByGroup,
    fetchData,
    fetchAllSums,
    update,
    setUpdate
  }
}

