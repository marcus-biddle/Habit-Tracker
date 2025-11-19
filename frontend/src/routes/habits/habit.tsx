import { deleteHabitEntries, fetchHabitEntriesFor, fetchHabitNameById } from '@/api/supabase';
import { supabase } from '@/api/client/client';
import React, { useState } from 'react'
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
import { ArrowUpDown, ChevronDown, Delete, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from '@/context/AuthContext';
import { AlertDialogButton } from '@/components/AlertDialogButton';
import { toast } from 'sonner';
import { ChartAreaInteractive } from '@/components/ChartAreaInteractive';

export async function clientLoader({
  params,
}) {
    const { data: { user } } = await supabase.auth.getUser();
    console.log(user, 'test')
    if (!user) return;

  const entries: HabitEntry[] = await fetchHabitEntriesFor(user.id, params.habitId);
  const habit = await fetchHabitNameById(params.habitId);
  return {habit: habit, entries: entries};
}

export type HabitEntry = {
  id: string;
  user_id: string;
  habit_id: string;
  entry_date: string;
  value: number;
  notes: string | null;
  created_at: string;
};


const columns: ColumnDef<HabitEntry>[] = [
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
    accessorKey: "entry_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("entry_date")}</div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase pl-8">{row.getValue("value")}</div>,
  },
  {
    accessorKey: "notes",
    header: () => <div className="">Notes</div>,
    cell: ({ row }) => {
      return <div className=" font-semibold text-slate-500">{row.getValue("notes")}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(entry.id)}
            >
              Copy Entry ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const habit = ({
  loaderData,
}) => {
    const { user } = useAuth();
    const [entries, setEntries] = React.useState<HabitEntry[]>(loaderData.entries);
    const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
 
  const table = useReactTable({
    data: entries,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
    console.log(entries, table.getFilteredSelectedRowModel().rows)

    const handleBatchDelete = async() => {
        if (!user) return;

        const idBatch = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        await deleteHabitEntries(idBatch);
        setEntries((prevEntries) => prevEntries.filter(e => !idBatch.find(id => id === e.id)));
        setRowSelection({})
        toast.success("Habit Entry deleted");
    }

    const groupedAndSummed = entries.reduce((acc, e) => {
        if (acc[e.entry_date]) {
        acc[e.entry_date].value += e.value;
        } else {
        acc[e.entry_date] = { date: e.entry_date, value: e.value };
        }
        return acc;
    }, {} as Record<string, { date: string; value: number }>);

  return (
    <div className='relative'>
        <div className='mb-8 flex-wrap'>
            <p className="text-muted-foreground text-lg">Habit</p>
            <h1 className="scroll-m-20 capitalize text-4xl font-extrabold tracking-tight text-balance">
                {loaderData.habit}
            </h1>
        </div>
        <div>
            <ChartAreaInteractive chartData={Object.values(groupedAndSummed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())} />
        </div>
        <div className="w-full">
        <div className="flex items-center py-4">
        <div className='ml-auto'>
            <AlertDialogButton onContinue={handleBatchDelete} variant={table.getFilteredSelectedRowModel().rows.length > 0 ? "destructive" : "outline"} disabled={table.getFilteredSelectedRowModel().rows.length <= 0} dialingDesc='Action cannot be undone.' buttonText={`Delete ${table.getFilteredSelectedRowModel().rows.length > 0 ? `Batch (${table.getFilteredSelectedRowModel().rows.length} rows)` : ''}`} />
        </div>

        </div>
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
    </div>
  )
}

export default habit;