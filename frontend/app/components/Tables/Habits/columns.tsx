import { type ColumnDef } from "@tanstack/react-table"

export type Habit = {
  id: string;                // UUID string, primary key
  user_id: string;           // UUID of the user who owns the habit
  name: string;              // Name of the habit
  description?: string | null; // Optional longer description or notes
  status: "active" | "inactive"; // Enum status
  unit: string;              // Unit of measurement for the habit
  frequency?: string | null; // How often the habit should be done (e.g., daily, weekly)
  goal?: number | null;      // Target goal for the habit, if any
  reminder_time?: string | null; // Time of day for reminders, in string format (e.g., "08:00:00")
  is_archived: boolean;      // Whether habit is archived
  group_id?: string | null;  // UUID of the habit group this habit belongs to (optional)
  created_at: string;        // Timestamp ISO string of creation
  updated_at: string;        // Timestamp ISO string of last update
};

export type HabitGroup = {
  id: string;                // UUID string, primary key
  user_id: string;           // UUID of the user who owns the group
  name: string;              // Name of the group (e.g., "Health Habits")
  description?: string | null; // Optional description of the group
  color?: string | null;     // Hex color code for UI customization (e.g., "#FF5733")
  display_order?: number | null; // Order for displaying groups
  created_at: string;        // Timestamp ISO string of creation
  updated_at: string;        // Timestamp ISO string of last update
};

export const columns: ColumnDef<Habit>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "goal",
    header: "Daily Goal",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
]