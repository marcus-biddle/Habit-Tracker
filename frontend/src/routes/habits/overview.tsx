import { deleteHabits, getHabitsByUserId } from '@/api/supabase'
import { type Habit } from '@/components/Tables/Habits/columns'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/api/client/client';
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
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TZDate } from '@date-fns/tz';
import { toast } from 'sonner'
import { HabitModalButton } from '@/components/Modals/Habits/HabitModalButton';
import { AlertDialogButton } from '@/components/AlertDialogButton';

export async function clientLoader() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const habits: Habit[] = await getHabitsByUserId(user.id);
    return habits;
}

const columns: ColumnDef<Habit>[] = [
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
    header: "Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "goal",
    header: "Frequency Goal",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("goal")}</div>
    ),
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("frequency")}</div>
    ),
  },
//   {
//     accessorKey: "value",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Amount
//           <ArrowUpDown />
//         </Button>
//       )
//     },
//     cell: ({ row }) => <div className="lowercase pl-8">{row.getValue("value")}</div>,
//   },
  {
    accessorKey: "unit",
    header: () => <div className="capitalize">Unit Type</div>,
    cell: ({ row }) => {
      return <div className=" font-semibold text-slate-500">{row.getValue("unit")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
        const date = new TZDate(row.getValue("created_at")).toISOString().split('T')[0];
        return <div className="capitalize">{date}</div>
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


const overview = ({ loaderData }) => {
    const { user } = useAuth();
    const [open, isOpen] = useState(false);
    const [habits, setHabits] = useState(loaderData);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data: habits,
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

    const handleBatchDelete = async() => {
        if (!user) return;

        const idBatch = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        await deleteHabits(idBatch);
        setHabits((prevHabits) => prevHabits.filter(e => !idBatch.find(id => id === e.id)));
        setRowSelection({})
        toast.success("Habit(s) deleted");
    }

    useEffect(() => {
        if (habits.length === 0) {
            isOpen(true);
        }
    }, [])

  return (
    <div className="w-full">
    <div className="flex items-center py-4">
    <div className='flex ml-auto gap-2 w-full max-w-sm '>
        <div className='w-full'>
            <AlertDialogButton onContinue={handleBatchDelete} variant={table.getFilteredSelectedRowModel().rows.length > 0 ? "destructive" : "outline"} disabled={table.getFilteredSelectedRowModel().rows.length <= 0} dialingDesc='Action cannot be undone.' buttonText={`Delete ${table.getFilteredSelectedRowModel().rows.length > 0 ? `Batch (${table.getFilteredSelectedRowModel().rows.length} rows)` : ''}`} />
        </div>
        <HabitModalButton open={open} isOpen={isOpen} />
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
  )
}

export default overview