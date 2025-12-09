# Habit Groups Feature Implementation

This document describes the implementation of the habit groups feature, which allows users to organize their habits into custom groups (e.g., "Health Habits", "Work Habits", etc.).

## Database Changes

### Migration File: `supabase_migration.sql`

Run this SQL migration in your Supabase SQL editor to create the necessary tables and relationships:

1. **Creates `habit_groups` table** with:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `name` (VARCHAR, unique per user)
   - `description` (TEXT, optional)
   - `color` (VARCHAR, hex color code for UI customization)
   - `display_order` (INTEGER, for custom ordering)
   - `created_at` and `updated_at` timestamps

2. **Adds `group_id` column to `habits` table**:
   - Foreign key to `habit_groups.id`
   - Nullable (existing habits will have NULL group_id)
   - ON DELETE SET NULL (when a group is deleted, habits are ungrouped)

3. **Creates indexes** for better query performance

4. **Sets up Row Level Security (RLS)** policies to ensure users can only access their own groups

5. **Creates helper function** `get_habits_with_groups()` for fetching habits with group information

## Frontend Changes

### Type Updates

- **`Habit` type** (`frontend/app/components/Tables/Habits/columns.tsx`):
  - Added `group_id?: string | null` field

- **`HabitGroup` type** (new):
  - Complete type definition for habit groups

### API Functions (`frontend/app/api/supabase.ts`)

New functions added:
- `getHabitGroupsByUserId(user_id)` - Fetch all groups for a user
- `addHabitGroup(group)` - Create a new group
- `updateHabitGroup(groupId, updates)` - Update an existing group
- `deleteHabitGroup(groupId)` - Delete a group
- `getHabitsByUserIdWithGroups(user_id)` - Fetch habits with group information

Updated functions:
- `addHabit()` - Now accepts `group_id` parameter
- `updateHabit()` - Now accepts `group_id` in updates

### Components

1. **`HabitGroupModal.tsx`** (new):
   - Modal for creating/editing habit groups
   - Includes fields for name, description, and color picker
   - Located at: `frontend/app/components/Modals/Habits/HabitGroupModal.tsx`

2. **`HabitModalButton.tsx`** (updated):
   - Added group selection dropdown when creating habits
   - Fetches available groups and displays them with color indicators

3. **`HabitEditModal.tsx`** (updated):
   - Added group selection dropdown when editing habits
   - Allows changing a habit's group assignment

4. **`overview.tsx`** (updated):
   - Added group filter dropdown
   - Added "Group" button to create new groups
   - Displays group information in table and grid views
   - Groups habits by their assigned groups (optional display mode)

## Usage

### Creating a Group

1. Navigate to the Habits Overview page (`/dashboard/habits`)
2. Click the "Group" button in the top toolbar
3. Fill in the group details:
   - **Name**: Required (e.g., "Health Habits")
   - **Description**: Optional
   - **Color**: Optional hex color for visual identification
4. Click "Create Group"

### Assigning Habits to Groups

**When Creating a Habit:**
1. Click "Habit" button to create a new habit
2. Fill in habit details
3. In the "Habit Group" dropdown, select a group (or leave as "No group")
4. Create the habit

**When Editing a Habit:**
1. Click the edit icon on any habit
2. Use the "Habit Group" dropdown to change the group assignment
3. Save changes

### Filtering by Group

On the Habits Overview page:
1. Use the group filter dropdown (folder icon)
2. Select:
   - "All Groups" - Show all habits
   - "Ungrouped" - Show only habits without a group
   - A specific group name - Show only habits in that group

### Viewing Groups

Groups are displayed:
- In the table view: As a badge in the "Group" column
- In the grid view: As a badge next to the habit name
- With color indicators (if a color is set for the group)

## Migration Steps

1. **Run the SQL migration**:
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase_migration.sql`
   - Execute the migration

2. **Deploy frontend changes**:
   - The frontend code is already updated
   - No additional configuration needed

3. **Test the feature**:
   - Create a test group
   - Create a habit and assign it to the group
   - Verify filtering and display work correctly

## Notes

- **Backward Compatibility**: Existing habits will have `group_id` as `NULL`, so they'll appear as "ungrouped"
- **Group Deletion**: When a group is deleted, all habits in that group will have their `group_id` set to `NULL` (ungrouped)
- **Unique Names**: Group names must be unique per user (enforced by database constraint)
- **Colors**: Group colors are stored as hex codes (e.g., "#3B82F6") and are optional
- **Display Order**: Groups can be ordered using the `display_order` field (future enhancement)

## Future Enhancements

Potential improvements:
- Drag-and-drop to reorder groups
- Group statistics (total habits, completion rates, etc.)
- Bulk assign habits to groups
- Group templates or presets
- Nested groups (groups within groups)
- Group-based analytics and reports

