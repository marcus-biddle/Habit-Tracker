-- Migration: Add Habit Groups Feature
-- This migration adds support for grouping habits into custom categories

-- Step 1: Create habit_groups table
CREATE TABLE IF NOT EXISTS habit_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code (e.g., #FF5733) for UI customization
  display_order INTEGER DEFAULT 0, -- For custom ordering of groups
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique group names per user
  CONSTRAINT unique_user_group_name UNIQUE (user_id, name)
);

-- Step 2: Add group_id column to habits table (nullable for backward compatibility)
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES habit_groups(id) ON DELETE SET NULL;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habit_groups_user_id ON habit_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_group_id ON habits(group_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_group ON habits(user_id, group_id);

-- Step 4: Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger for habit_groups updated_at
DROP TRIGGER IF EXISTS update_habit_groups_updated_at ON habit_groups;
CREATE TRIGGER update_habit_groups_updated_at
  BEFORE UPDATE ON habit_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security (RLS) for habit_groups
ALTER TABLE habit_groups ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for habit_groups
-- Policy: Users can only see their own groups
CREATE POLICY "Users can view their own habit groups"
  ON habit_groups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own habit groups
CREATE POLICY "Users can insert their own habit groups"
  ON habit_groups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own habit groups
CREATE POLICY "Users can update their own habit groups"
  ON habit_groups
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own habit groups
CREATE POLICY "Users can delete their own habit groups"
  ON habit_groups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Optional - Create a function to get habits with their groups
CREATE OR REPLACE FUNCTION get_habits_with_groups(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name VARCHAR,
  description TEXT,
  status VARCHAR,
  unit VARCHAR,
  frequency VARCHAR,
  goal INTEGER,
  reminder_time TIME,
  is_archived BOOLEAN,
  group_id UUID,
  group_name VARCHAR,
  group_color VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.user_id,
    h.name,
    h.description,
    h.status,
    h.unit,
    h.frequency,
    h.goal,
    h.reminder_time,
    h.is_archived,
    h.group_id,
    hg.name AS group_name,
    hg.color AS group_color,
    h.created_at,
    h.updated_at
  FROM habits h
  LEFT JOIN habit_groups hg ON h.group_id = hg.id
  WHERE h.user_id = p_user_id
  ORDER BY 
    COALESCE(hg.display_order, 999999),
    hg.name NULLS LAST,
    h.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notes:
-- 1. The group_id in habits table is nullable, so existing habits will continue to work
-- 2. When a group is deleted, habits in that group will have their group_id set to NULL (ON DELETE SET NULL)
-- 3. RLS policies ensure users can only access their own groups
-- 4. The get_habits_with_groups function provides a convenient way to fetch habits with group information
-- 5. You can add a default "Ungrouped" group later if needed, or handle null group_id in the UI

