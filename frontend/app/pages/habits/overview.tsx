import { deleteHabits, getHabitsByUserId, updateHabit, updateHabitsBatch } from '../../api/supabase'
import { type Habit } from '../../components/Tables/Habits/columns'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../api/client/client';
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { MoreHorizontal, Search, Filter, Archive, ArchiveRestore, Play, Pause, Edit2, LayoutGrid, List, X, Flame, Target, Calendar } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { TZDate } from '@date-fns/tz';
import { toast } from 'sonner'
import { HabitModalButton } from '../../components/Modals/Habits/HabitModalButton';
import { AlertDialogButton } from '../../components/AlertDialogButton';
import { Link } from 'react-router';
import { Separator } from "../../components/ui/separator"
import { HabitEditModal } from '../../components/Modals/Habits/HabitEditModal';
import type { DashboardHabit } from '../../features/overview/table'

export async function clientLoader() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const habits: Habit[] = await getHabitsByUserId(user.id);
    const { data: stats } = await supabase.rpc('get_habit_dashboard_stats', { 
      p_user_id: user.id 
    });

    return { habits: habits ?? [], stats: stats ?? [] };
}

const overview = ({ loaderData }: any) => {
    const { user } = useAuth();
    const [open, isOpen] = useState(false);
    const [habits, setHabits] = useState<Habit[]>(loaderData.habits ?? []);
    const [stats, setStats] = useState<DashboardHabit[]>(loaderData.stats ?? []);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    // Filter habits based on search and status
    const filteredHabits = useMemo(() => {
        let filtered = habits;

        // Status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(h => h.status === 'active' && !h.is_archived);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(h => h.status === 'inactive' && !h.is_archived);
        } else if (statusFilter === 'archived') {
            filtered = filtered.filter(h => h.is_archived);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(h => 
                h.name.toLowerCase().includes(query) ||
                h.description?.toLowerCase().includes(query) ||
                h.unit.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [habits, searchQuery, statusFilter]);

    // Create a simple row selection map for grid view
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const toggleRowSelection = (habitId: string) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(habitId)) {
                next.delete(habitId);
            } else {
                next.add(habitId);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedRows(new Set());
    };

    const table = useReactTable({
        data: filteredHabits,
        columns: [],
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const selectedHabitsFromGrid = filteredHabits.filter(h => selectedRows.has(h.id));
    const selectedCount = viewMode === 'table' 
        ? table.getFilteredSelectedRowModel().rows.length 
        : selectedHabitsFromGrid.length;
    const selectedHabits = viewMode === 'table'
        ? table.getFilteredSelectedRowModel().rows.map(row => row.original)
        : selectedHabitsFromGrid;


    const handleBatchDelete = async() => {
        if (!user) return;

        const idBatch = selectedHabits.map(h => h.id);
        await deleteHabits(idBatch);
        setHabits((prevHabits: Habit[]) => prevHabits.filter(e => !idBatch.includes(e.id)));
        setRowSelection({});
        clearSelection();
        toast.success("Habit(s) deleted");
    }

    const handleBatchArchive = async (archive: boolean, habitId?: string) => {
        if (!user) return;

        const idBatch = habitId ? [habitId] : selectedHabits.map(h => h.id);
        if (idBatch.length === 0) return;

        try {
            await updateHabitsBatch(idBatch, { is_archived: archive });
            setHabits((prevHabits: Habit[]) => 
                prevHabits.map(h => 
                    idBatch.includes(h.id) ? { ...h, is_archived: archive } : h
                )
            );
            setRowSelection({});
            clearSelection();
            toast.success(`${archive ? 'Archived' : 'Unarchived'} ${idBatch.length} habit(s)`);
        } catch (error) {
            toast.error("Failed to update habits");
        }
    }

    const handleBatchStatusChange = async (status: 'active' | 'inactive', habitId?: string) => {
        if (!user) return;

        const idBatch = habitId ? [habitId] : selectedHabits.map(h => h.id);
        if (idBatch.length === 0) return;

        try {
            await updateHabitsBatch(idBatch, { status });
            setHabits((prevHabits: Habit[]) => 
                prevHabits.map(h => 
                    idBatch.includes(h.id) ? { ...h, status } : h
                )
            );
            setRowSelection({});
            clearSelection();
            toast.success(`Updated ${idBatch.length} habit(s) to ${status}`);
        } catch (error) {
            toast.error("Failed to update habits");
        }
    }

    const handleEditHabit = async (updatedHabit: Habit) => {
        if (!user) return;

        try {
            await updateHabit(updatedHabit.id, {
                name: updatedHabit.name,
                description: updatedHabit.description,
                status: updatedHabit.status,
                unit: updatedHabit.unit,
                frequency: updatedHabit.frequency,
                goal: updatedHabit.goal,
                reminder_time: updatedHabit.reminder_time,
                is_archived: updatedHabit.is_archived,
            });
            setHabits((prevHabits: Habit[]) => 
                prevHabits.map(h => h.id === updatedHabit.id ? updatedHabit : h)
            );
            setEditingHabit(null);
            toast.success("Habit updated successfully");
        } catch (error) {
            toast.error("Failed to update habit");
        }
    }

    const getHabitStats = (habitId: string) => {
        return stats.find((s: DashboardHabit) => s.habit_id === habitId);
    }

    const refreshData = async () => {
        if (!user) return;
        const res = await getHabitsByUserId(user.id);
        setHabits(res);
        const { data: newStats } = await supabase.rpc('get_habit_dashboard_stats', { 
            p_user_id: user.id 
        });
        setStats(newStats ?? []);
    }

    useEffect(() => {
        if (habits.length === 0) {
            isOpen(true);
        }
    }, [])

    // Summary stats
    const summaryStats = useMemo(() => {
        const active = habits.filter(h => h.status === 'active' && !h.is_archived).length;
        const inactive = habits.filter(h => h.status === 'inactive' && !h.is_archived).length;
        const archived = habits.filter(h => h.is_archived).length;
        const total = habits.length;
        const avgStreak = stats.length > 0
            ? Math.round(stats.reduce((sum: number, s: DashboardHabit) => sum + (s.current_streak ?? 0), 0) / stats.length)
            : 0;

        return { active, inactive, archived, total, avgStreak };
    }, [habits, stats]);

  return (
        <div className="w-full space-y-6">
            {/* Header */}
      <div>
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    Habit Management
        </h2>
                <p className="leading-7 text-muted-foreground mt-2">
                    Organize, configure, and manage all your habits in one place.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Habits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{summaryStats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Inactive</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">{summaryStats.inactive}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Archived</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">{summaryStats.archived}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg Streak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-chart-4" />
                            <span className="text-2xl font-bold">{summaryStats.avgStreak}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 flex gap-2 items-center w-full sm:w-auto">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search habits..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-7 w-7"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                        All Habits
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                                        Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                                        Inactive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                                        Archived
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
      </div>
                        <div className="flex gap-2">
                            <div className="flex border rounded-md">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-r-none"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-l-none"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
          </div>
                            <HabitModalButton 
                                open={open} 
                                isOpen={isOpen} 
                                setHabits={async () => {
                                    // Refresh from server to get complete data
                                    await refreshData();
                                }} 
                            />
        </div>
      </div>
                </CardHeader>
                {selectedCount > 0 && (
                    <>
                        <Separator />
                        <CardContent className="pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {selectedCount} habit(s) selected
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBatchStatusChange('active')}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Activate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBatchStatusChange('inactive')}
                                >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Deactivate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBatchArchive(true)}
                                >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBatchArchive(false)}
                                >
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Unarchive
                                </Button>
                                <Separator orientation="vertical" className="h-4" />
                                <AlertDialogButton
                                    onContinue={handleBatchDelete}
                                    variant="destructive"
                                    dialingDesc="This action cannot be undone. All selected habits will be permanently deleted."
                                    buttonText="Delete"
                                />
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Habits Display */}
            {viewMode === 'table' ? (
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
                                        <TableHead>Goal</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stats</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-12"></TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
                                    {filteredHabits.length > 0 ? (
                                        filteredHabits.map((habit) => {
                                            const habitStats = getHabitStats(habit.id);
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
                                                                const row = table.getRowModel().rows.find(r => r.original.id === habit.id);
                                                                if (row) row.toggleSelected(!!value);
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
                                                                <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
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
                                                                    onClick={() => handleBatchStatusChange(habit.status === 'active' ? 'inactive' : 'active', habit.id)}
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
                                                                    onClick={() => handleBatchArchive(!habit.is_archived, habit.id)}
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
                                            );
                                        })
        ) : (
        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No habits found. {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first habit to get started!'}
        </TableCell>
        </TableRow>
        )}
        </TableBody>
        </Table>
      </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHabits.length > 0 ? (
                        filteredHabits.map((habit) => {
                            const habitStats = getHabitStats(habit.id);
                            const isSelected = selectedRows.has(habit.id);
                            return (
                                <Card
                                    key={habit.id}
                                    className={habit.is_archived ? "opacity-60" : ""}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="capitalize">{habit.name}</CardTitle>
                                                {habit.description && (
                                                    <CardDescription className="mt-1 line-clamp-2">
                                                        {habit.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleRowSelection(habit.id)}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={habit.status === 'active' ? 'default' : 'secondary'}
                                                className="capitalize"
                                            >
                                                {habit.status}
                                            </Badge>
                                            {habit.is_archived && (
                                                <Badge variant="outline">Archived</Badge>
                                            )}
                                            <Badge variant="outline" className="capitalize">
                                                {habit.frequency ?? 'N/A'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Goal</span>
                                                <span className="font-medium">
                                                    {habit.goal ?? 0} {habit.unit}
                                                </span>
                                            </div>
                                            {habitStats && (
                                                <>
                                                    {habitStats.current_streak > 0 && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">Current Streak</span>
                                                            <div className="flex items-center gap-1">
                                                                <Flame className="h-3 w-3 text-chart-4" />
                                                                <span className="font-medium">{habitStats.current_streak} days</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Week Completion</span>
                                                        <span className="font-medium">{habitStats.week_completion ?? 0}%</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Created</span>
                                                <span className="font-medium">
                                                    {new TZDate(habit.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
      </div>
                                        <div className="flex gap-2 pt-2">
      <Button
      variant="outline"
      size="sm"
                                                className="flex-1"
                                                asChild
      >
                                                <Link to={`/dashboard/habits/${habit.id}`}>
                                                    View Details
                                                </Link>
      </Button>
      <Button
      variant="outline"
      size="sm"
                                                onClick={() => setEditingHabit(habit)}
      >
                                                <Edit2 className="h-4 w-4" />
      </Button>
      </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No habits found. {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first habit to get started!'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
      </div>
            )}

            {/* Edit Modal */}
            {editingHabit && (
                <HabitEditModal
                    habit={editingHabit}
                    open={!!editingHabit}
                    onOpenChange={(open) => !open && setEditingHabit(null)}
                    onSave={handleEditHabit}
                />
            )}
    </div>
  )
}

export default overview
