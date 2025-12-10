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
import { Lock, MoreHorizontal, Unlock } from "lucide-react"
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
import { TZDate } from '@date-fns/tz'
import { Link } from 'react-router'

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

const columns: ColumnDef<DashboardHabit>[] = [
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
    cell: ({ row }) => {
      return (
      <Link to={`/dashboard/habits/${row.original.habit_id}`} className="capitalize">{row.original.habit_name}</Link>
    )},
  },
  {
    accessorKey: "longest_streak",
    header: "Longest Streak",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.longest_streak}</div>
    ),
  },
  {
    accessorKey: "current_streak",
    header: "Current Streak",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.current_streak}</div>
    ),
  },
//   {
//     accessorKey: "completion_rate",
//     header: "Completion Rate",
//     cell: ({ row }) => (
//       <div className="capitalize">{row.getValue("frequency")}</div>
//     ),
//   },
  {
    accessorKey: "last_entry_date",
    header: "Last Updated",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.last_entry_date}</div>
    ),
  },
  {
    accessorKey: "today_value",
    header: "Today's Amount",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.today_value ? row.original.today_value : 0}</div>
    ),
  },
  {
    accessorKey: "join_count",
    header: "Users Joined",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.join_count}</div>
    ),
  },
  {
    accessorKey: "is_public",
    header: "Public",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.is_public ? <Unlock className='size-4' /> : <Lock className='size-4' />}</div>
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
//   {
//     accessorKey: "unit",
//     header: () => <div className="capitalize">Unit Type</div>,
//     cell: ({ row }) => {
//       return <div className=" font-semibold text-slate-500">{row.getValue("unit")}</div>
//     },
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <div className="capitalize">{row.getValue("status")}</div>
//     ),
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created At",
//     cell: ({ row }) => {
//         const date = new TZDate(row.getValue("created_at")).toISOString().split('T')[0];
//         return <div className="capitalize">{date}</div>
//     },
//   },
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
            //   onClick={() => navigator.clipboard.writeText(entry.id)}
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

type ReusableTableProps = {
    data: any;
}

const ReusableTable = ({ data }: ReusableTableProps) => {
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data: data,
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