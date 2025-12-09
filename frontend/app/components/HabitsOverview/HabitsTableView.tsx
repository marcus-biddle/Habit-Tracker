import { Link } from 'react-router'
import { Card, CardContent } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Checkbox } from '../../components/ui/checkbox'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { MoreHorizontal, Target, Calendar, Edit2, Play, Pause, Archive, ArchiveRestore, Flame } from 'lucide-react'
import { TZDate } from '@date-fns/tz'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'
import type { Table as TanstackTable } from '@tanstack/react-table'
import type { DashboardHabit } from '../../features/overview/table'

interface HabitsTableViewProps {
  habits: Habit[]
  groups: HabitGroup[]
  stats: DashboardHabit[]
  table: TanstackTable<Habit>
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive' | 'archived'
  onEdit: (habit: Habit) => void
  onStatusChange: (status: 'active' | 'inactive', habitId?: string) => void
  onArchive: (archive: boolean, habitId?: string) => void
  getHabitStats: (habitId: string) => DashboardHabit | undefined
}

export function HabitsTableView({
  habits,
  groups,
  stats,
  table,
  searchQuery,
  statusFilter,
  onEdit,
  onStatusChange,
  onArchive,
  getHabitStats
}: HabitsTableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Habit</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.length > 0 ? (
                habits.map((habit) => {
                  const habitStats = getHabitStats(habit.id)
                  return (
                    <TableRow
                      key={habit.id}
                      data-state={table.getRowModel().rows.some(r => r.original.id === habit.id && r.getIsSelected()) && "selected"}
                      className={habit.is_archived ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={table.getRowModel().rows.some(r => r.original.id === habit.id && r.getIsSelected())}
                          onCheckedChange={(value) => {
                            const row = table.getRowModel().rows.find(r => r.original.id === habit.id)
                            if (row) row.toggleSelected(!!value)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            to={`/dashboard/habits/${habit.id}`}
                            className="font-medium capitalize hover:underline"
                          >
                            {habit.name}
                          </Link>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {habit.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {habit.group_id ? (
                          <div className="flex items-center gap-2">
                            {(() => {
                              const group = groups.find(g => g.id === habit.group_id)
                              return group ? (
                                <>
                                  {group.color && (
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: group.color }}
                                    />
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {group.name}
                                  </Badge>
                                </>
                              ) : null
                            })()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span>{habit.goal ?? 0} {habit.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {habit.frequency ?? 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={habit.status === 'active' ? 'default' : 'secondary'}
                            className="w-fit capitalize"
                          >
                            {habit.status}
                          </Badge>
                          {habit.is_archived && (
                            <Badge variant="outline" className="w-fit text-xs">
                              Archived
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {habitStats ? (
                          <div className="flex items-center gap-2 text-sm">
                            {habitStats.current_streak > 0 && (
                              <div className="flex items-center gap-1">
                                <Flame className="h-3 w-3 text-chart-4" />
                                <span>{habitStats.current_streak}</span>
                              </div>
                            )}
                            <span className="text-muted-foreground">
                              {habitStats.week_completion ?? 0}% week
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new TZDate(habit.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(habit)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/habits/${habit.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onStatusChange(habit.status === 'active' ? 'inactive' : 'active', habit.id)}
                            >
                              {habit.status === 'active' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onArchive(!habit.is_archived, habit.id)}
                            >
                              {habit.is_archived ? (
                                <>
                                  <ArchiveRestore className="h-4 w-4 mr-2" />
                                  Unarchive
                                </>
                              ) : (
                                <>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No habits found. {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first habit to get started!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

