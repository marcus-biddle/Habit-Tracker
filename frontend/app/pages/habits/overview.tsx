import { deleteHabits, updateHabit, updateHabitsBatch, getHabitGroupsByUserId, getHabitsByUserIdWithGroups } from '../../api/supabase'
import { type Habit, type HabitGroup } from '../../components/Tables/Habits/columns'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../api/client/client'
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
import { toast } from 'sonner'
import { HabitGroupSheet } from '../../components/Modals/Habits/HabitGroupSheet'
import { HabitEditSheet } from '../../components/Modals/Habits/HabitEditSheet'
import type { DashboardHabit } from '../../features/overview/table'
import {
  HabitsOverviewHeader,
  SummaryStatsCards,
  FiltersAndActionsCard,
  BatchActionsBar,
  HabitsTableView,
  HabitsGridView,
  useHabitsFiltering,
  useHabitsSummaryStats
} from '../../components/HabitsOverview'

export async function clientLoader() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const habits: Habit[] = await getHabitsByUserIdWithGroups(user.id);
    const groups: HabitGroup[] = await getHabitGroupsByUserId(user.id);
    const { data: stats } = await supabase.rpc('get_habit_dashboard_stats', { 
      p_user_id: user.id 
    });

    return { habits: habits ?? [], groups: groups ?? [], stats: stats ?? [] };
}

const overview = ({ loaderData }: any) => {
    const { user } = useAuth();
    const [, isOpen] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [habits, setHabits] = useState<Habit[]>(loaderData.habits ?? []);
    const [groups, setGroups] = useState<HabitGroup[]>(loaderData.groups ?? []);
    const [stats, setStats] = useState<DashboardHabit[]>(loaderData.stats ?? []);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const { filteredHabits } = useHabitsFiltering(habits, searchQuery, statusFilter, groupFilter)
    const summaryStats = useHabitsSummaryStats(habits, stats)

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

    const getHabitStats = (habitId: string) => {
        return stats.find((s: DashboardHabit) => s.habit_id === habitId);
    }

    const refreshData = async () => {
        if (!user) return;
        const res = await getHabitsByUserIdWithGroups(user.id);
        setHabits(res);
        const groupsRes = await getHabitGroupsByUserId(user.id);
        setGroups(groupsRes);
        const { data: newStats } = await supabase.rpc('get_habit_dashboard_stats', { 
            p_user_id: user.id 
        });
        setStats(newStats ?? []);
    }

    const handleEditHabit = async (updatedHabit: Habit) => {
        if (!user) return;

        try {
            // Ensure group_id is properly handled (null, undefined, or valid UUID string)
            const groupId = updatedHabit.group_id && typeof updatedHabit.group_id === 'string' && updatedHabit.group_id.trim() !== ''
                ? updatedHabit.group_id.trim()
                : null;

            console.log('Updating habit with:', { 
                habitId: updatedHabit.id, 
                group_id: groupId,
                original_group_id: updatedHabit.group_id 
            });

            await updateHabit(user.id, updatedHabit.id, {
                name: updatedHabit.name,
                description: updatedHabit.description,
                status: updatedHabit.status,
                unit: updatedHabit.unit,
                frequency: updatedHabit.frequency,
                goal: updatedHabit.goal,
                reminder_time: updatedHabit.reminder_time,
                is_archived: updatedHabit.is_archived,
                group_id: groupId,
                tracking_type: updatedHabit.tracking_type || null,
                goal_period: updatedHabit.goal_period || null,
                min_value: updatedHabit.min_value ?? null,
                max_value: updatedHabit.max_value ?? null,
                unit_display: updatedHabit.unit_display || null,
            });
            
            // Refresh data to get the latest from the database
            await refreshData();
            setEditingHabit(null);
            toast.success("Habit updated successfully");
        } catch (error: any) {
            console.error("Error updating habit:", error);
            toast.error(error?.message || "Failed to update habit");
        }
    }

    useEffect(() => {
        if (habits.length === 0) {
            isOpen(true);
        }
    }, [])


  return (
    <div className="w-full space-y-6">
      <HabitsOverviewHeader />

      <SummaryStatsCards stats={summaryStats} />

      <FiltersAndActionsCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        groupFilter={groupFilter}
        onGroupFilterChange={setGroupFilter}
        groups={groups}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onGroupModalOpen={() => setGroupModalOpen(true)}
        onHabitModalOpen={isOpen}
        onRefresh={refreshData}
      />

      <BatchActionsBar
        selectedCount={selectedCount}
        onActivate={() => handleBatchStatusChange('active')}
        onDeactivate={() => handleBatchStatusChange('inactive')}
        onArchive={() => handleBatchArchive(true)}
        onUnarchive={() => handleBatchArchive(false)}
        onDelete={handleBatchDelete}
      />

      {viewMode === 'table' ? (
        <HabitsTableView
          habits={filteredHabits}
          groups={groups}
          stats={stats}
          table={table}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onEdit={setEditingHabit}
          onStatusChange={handleBatchStatusChange}
          onArchive={handleBatchArchive}
          getHabitStats={getHabitStats}
        />
      ) : (
        <HabitsGridView
          habits={filteredHabits}
          groups={groups}
          stats={stats}
          selectedRows={selectedRows}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onToggleSelection={toggleRowSelection}
          onEdit={setEditingHabit}
          getHabitStats={getHabitStats}
        />
      )}

      {/* Edit Modal */}
      {editingHabit && (
        <HabitEditSheet
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onSave={handleEditHabit}
        />
      )}

      {/* Group Modal */}
      <HabitGroupSheet
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        onSuccess={async () => {
          await refreshData()
        }}
      />
    </div>
  )
}

export default overview
