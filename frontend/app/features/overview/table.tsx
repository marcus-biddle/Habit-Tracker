import React, { useState, useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, AlertTriangle, TrendingUp, ExternalLink, Plus, Edit2, BarChart3 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { TZDate } from '@date-fns/tz'
import { Link } from 'react-router'
import type { Habit } from '../../components/Tables/Habits/columns'
import { 
  getEffectiveGoal, 
  getEffectiveCurrentValue, 
  calculateProgress, 
  isGoalMet,
  getGoalPeriodText,
  getDisplayUnit
} from '../../components/Home/utils/habitCalculations'

export interface DashboardHabit {
  habit_id: string;
  habit_name: string;
  is_public: boolean;
  join_count: number;
  current_streak: number;
  longest_streak: number;
  today_value: number | null;
  week_completion: number;
  period_total: number | null;
  last_entry_date: string;
}

export interface EnrichedHabitRow {
  habit: Habit;
  stats: DashboardHabit;
  dailyValue: number;
  progress: number;
  isCompleted: boolean;
  daysSinceLastEntry: number;
  isAtRisk: boolean;
  goalPeriod: string;
  currentValue: number;
  goal: number;
  unit: string;
}

const createColumns = (
  onQuickLog?: (habitId: string, increment: number) => void,
  onManualLog?: (habitId: string, value: number) => void
): ColumnDef<EnrichedHabitRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
            row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Habit Name",
    cell: ({ row }) => {
      return (
        <Link 
          to={`/dashboard/habits/${row.original.habit.id}`} 
          className="font-medium hover:underline"
        >
          {row.original.habit.name}
        </Link>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { isCompleted, isAtRisk, progress } = row.original
      return (
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          ) : isAtRisk ? (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">At Risk</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const { progress, currentValue, goal, unit, isCompleted } = row.original
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {currentValue} / {goal} {unit}
              </span>
              <span className={`font-medium ${isCompleted ? 'text-primary' : ''}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress >= 100 ? 'bg-primary' :
                  progress >= 50 ? 'bg-accent' :
                  'bg-muted-foreground'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "goalPeriod",
    header: "Frequency",
    cell: ({ row }) => {
      const period = row.original.goalPeriod
      return (
        <Badge variant="outline" className="text-xs">
          {period}
        </Badge>
      )
    },
  },
  {
    accessorKey: "daysSinceLastEntry",
    header: "Last Entry",
    cell: ({ row }) => {
      const days = row.original.daysSinceLastEntry
      const lastEntryDate = row.original.stats.last_entry_date
      
      if (!lastEntryDate) {
        return <span className="text-sm text-muted-foreground">Never</span>
      }
      
      if (days === 0) {
        return <span className="text-sm font-medium text-primary">Today</span>
      }
      if (days === 1) {
        return <span className="text-sm">Yesterday</span>
      }
      if (days < 7) {
        return <span className="text-sm">{days} days ago</span>
      }
      return (
        <span className="text-sm text-muted-foreground">
          {new TZDate(lastEntryDate).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "current_streak",
    header: "Streak",
    cell: ({ row }) => {
      const streak = row.original.stats.current_streak
      const longestStreak = row.original.stats.longest_streak
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{streak} days</span>
          {longestStreak > streak && (
            <span className="text-xs text-muted-foreground">
              Best: {longestStreak}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { habit, isCompleted } = row.original
      const isBinary = habit.tracking_type === 'binary'
      const effectiveGoal = getEffectiveGoal(habit)
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            
            {/* Quick Log Entry */}
            {onQuickLog && !isCompleted && (
              <>
                {!isBinary && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onQuickLog(habit.id, 1)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log +1 Entry
                    </DropdownMenuItem>
                    {effectiveGoal > 1 && (
                      <DropdownMenuItem
                        onClick={() => onQuickLog(habit.id, effectiveGoal)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Log Goal ({effectiveGoal})
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {isBinary && (
                  <DropdownMenuItem
                    onClick={() => onQuickLog(habit.id, 1)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* Navigation Actions */}
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/habits/${habit.id}`} className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/analytics?habit=${habit.id}`} className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Edit Action */}
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/habits/overview?edit=${habit.id}`} className="flex items-center">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Habit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

type ReusableTableProps = {
    data: DashboardHabit[];
    habits?: Habit[];
    dailySums?: { id: string; value: number }[];
    onQuickLog?: (habitId: string, increment: number) => void;
    onManualLog?: (habitId: string, value: number) => void;
}

const ReusableTable = ({ data, habits = [], dailySums = [], onQuickLog, onManualLog }: ReusableTableProps) => {
    const [rowSelection, setRowSelection] = useState({})

    // Enrich the data with habit details and calculated metrics
    const enrichedData = useMemo<EnrichedHabitRow[]>(() => {
      if (!habits || habits.length === 0) {
        // Fallback to basic data if habits not provided
        return data.map(stat => {
          const dailyValue = dailySums.find(ds => ds.id === stat.habit_id)?.value ?? 0
          
          // Return minimal data if habit not found
          return {
            habit: {
              id: stat.habit_id,
              name: stat.habit_name,
              user_id: '',
              status: 'active',
              unit: '',
              is_archived: false,
              created_at: '',
              updated_at: '',
            } as Habit,
            stats: stat,
            dailyValue,
            progress: 0,
            isCompleted: false,
            daysSinceLastEntry: 0,
            isAtRisk: false,
            goalPeriod: 'per day',
            currentValue: 0,
            goal: 0,
            unit: '',
          }
        })
      }

      return data.map(stat => {
        const habit = habits.find(h => h.id === stat.habit_id)
        if (!habit) return null

        const dailyValue = dailySums.find(ds => ds.id === stat.habit_id)?.value ?? 0
        const periodTotal = stat.period_total ?? null
        const currentValue = getEffectiveCurrentValue(habit, dailyValue, periodTotal)
        const goal = getEffectiveGoal(habit)
        const progress = calculateProgress(habit, currentValue)
        const isCompleted = isGoalMet(habit, currentValue)
        const unit = getDisplayUnit(habit)
        const goalPeriod = getGoalPeriodText(habit.goal_period)

        // Calculate days since last entry
        let daysSinceLastEntry = 0
        if (stat.last_entry_date) {
          // Parse the date string (YYYY-MM-DD) as local date to avoid timezone issues
          const dateParts = stat.last_entry_date.split('-')
          const lastEntryYear = parseInt(dateParts[0], 10)
          const lastEntryMonth = parseInt(dateParts[1], 10) - 1 // month is 0-indexed
          const lastEntryDay = parseInt(dateParts[2], 10)
          
          const today = new TZDate()
          const startOfToday = new TZDate(today.getFullYear(), today.getMonth(), today.getDate())
          const startOfLastEntry = new TZDate(lastEntryYear, lastEntryMonth, lastEntryDay)
          const diffMs = startOfToday.getTime() - startOfLastEntry.getTime()
          daysSinceLastEntry = Math.round(diffMs / (1000 * 60 * 60 * 24))
        } else {
          daysSinceLastEntry = 999 // Never logged
        }

        // At risk: has a streak but no entry today
        const isAtRisk = (stat.current_streak ?? 0) > 0 && dailyValue === 0 && daysSinceLastEntry > 0

        return {
          habit,
          stats: stat,
          dailyValue,
          progress,
          isCompleted,
          daysSinceLastEntry,
          isAtRisk,
          goalPeriod,
          currentValue,
          goal,
          unit,
        }
      }).filter((row): row is EnrichedHabitRow => row !== null)
    }, [data, habits, dailySums])

    const columns = useMemo(() => createColumns(onQuickLog, onManualLog), [onQuickLog, onManualLog])

    const table = useReactTable({
        data: enrichedData,
        columns,
        // onSortingChange: setSorting,
        // onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        // onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
        // sorting,
        // columnFilters,
        // columnVisibility,
        rowSelection,
        },
    })

    // const handleBatchDelete = async() => {
    //     if (!user) return;

    //     const idBatch = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    //     await deleteHabits(idBatch);
    //     setHabits((prevHabits: Habit[]) => prevHabits.filter(e => !idBatch.find(id => id === e.id)));
    //     setRowSelection({})
    //     toast.success("Habit(s) deleted");
    // }

  return (
    <div>
        <div className="overflow-hidden rounded-md border">
                <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                return (
                <TableHead key={header.id}>
                {header.isPlaceholder
                ? null
                : flexRender(
                header.column.columnDef.header,
                header.getContext()
                )}
                </TableHead>
                )
                })}
                </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                >
                {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
                )}
                </TableCell>
                ))}
                </TableRow>
                ))
                ) : (
                <TableRow>
                <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
                >
                No results.
                </TableCell>
                </TableRow>
                )}
                </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
              <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              >
              Previous
              </Button>
              <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              >
              Next
              </Button>
              </div>
              </div>
    </div>
  )
}

export default ReusableTable