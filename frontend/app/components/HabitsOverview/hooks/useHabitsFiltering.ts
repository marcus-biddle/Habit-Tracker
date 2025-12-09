import { useMemo } from 'react'
import type { Habit } from '../../Tables/Habits/columns'

export function useHabitsFiltering(
  habits: Habit[],
  searchQuery: string,
  statusFilter: 'all' | 'active' | 'inactive' | 'archived',
  groupFilter: string
) {
  const filteredHabits = useMemo(() => {
    let filtered = habits

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(h => h.status === 'active' && !h.is_archived)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(h => h.status === 'inactive' && !h.is_archived)
    } else if (statusFilter === 'archived') {
      filtered = filtered.filter(h => h.is_archived)
    }

    // Group filter
    if (groupFilter !== 'all') {
      if (groupFilter === 'ungrouped') {
        filtered = filtered.filter(h => !h.group_id)
      } else {
        filtered = filtered.filter(h => h.group_id === groupFilter)
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(query) ||
        h.description?.toLowerCase().includes(query) ||
        h.unit.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [habits, searchQuery, statusFilter, groupFilter])

  const groupedHabits = useMemo(() => {
    const grouped: Record<string, Habit[]> = {}
    const ungrouped: Habit[] = []

    filteredHabits.forEach(habit => {
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
  }, [filteredHabits])

  return {
    filteredHabits,
    groupedHabits
  }
}

