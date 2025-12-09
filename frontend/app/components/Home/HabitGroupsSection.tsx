import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Folder, FolderOpen, CheckCircle2 } from 'lucide-react'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'

interface GroupStats {
  groupId: string
  totalHabits: number
  completedToday: number
  completionRate: number
  totalStreak: number
  avgStreak: number
  totalProgress: number
  avgProgress: number
}

interface HabitGroupsSectionProps {
  groups: HabitGroup[]
  groupStats: GroupStats[]
  habitsByGroup: Record<string, Habit[]>
  dailySums: { id: string; value: number }[]
}

export function HabitGroupsSection({
  groups,
  groupStats,
  habitsByGroup,
  dailySums
}: HabitGroupsSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  if (groups.length === 0) return null

  return (
    <div className="w-full">
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
        className="grid gap-4 w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
        }}
      >
        {groups.map((group) => {
          const stats = groupStats.find(s => s.groupId === group.id)
          const groupHabits = habitsByGroup[group.id] || []
          const isExpanded = expandedGroups.has(group.id)

          if (!stats || stats.totalHabits === 0) return null

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full min-w-0"
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow w-full"
                onClick={() => {
                  const newExpanded = new Set(expandedGroups)
                  if (isExpanded) {
                    newExpanded.delete(group.id)
                  } else {
                    newExpanded.add(group.id)
                  }
                  setExpandedGroups(newExpanded)
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
                        const sum = dailySums.find((ds: { id: string; value: number }) => ds.id === habit.id)
                        const currentValue = sum?.value ?? 0
                        const progress = habit.goal 
                          ? Math.min((currentValue / habit.goal) * 100, 100)
                          : 0
                        const isCompleted = currentValue > 0

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
                        )
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
          )
        })}
      </div>
    </div>
  )
}

