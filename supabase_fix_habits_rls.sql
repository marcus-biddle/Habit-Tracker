-- Fix RLS Policies for Habits Table to Allow group_id Updates
-- This script checks and fixes Row Level Security policies for the habits table

-- Step 1: Check if RLS is enabled on habits table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'habits';

-- Step 2: Enable RLS if not already enabled
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing UPDATE policy if it exists (to recreate it properly)
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "habits_update_policy" ON habits;

-- Step 4: Create a comprehensive UPDATE policy that allows updating all columns including group_id
-- This policy uses USING to check if the user owns the habit, and WITH CHECK to validate the update
CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'habits' AND cmd = 'UPDATE';

-- Step 6: Test query to verify the policy works (run this as a logged-in user)
-- This should return rows if the policy is working correctly
-- SELECT * FROM habits WHERE user_id = auth.uid() LIMIT 1;

-- Step 7: Optional - If you need to allow updates even when group_id references a group
-- that might not be visible due to RLS, you can use a more permissive policy:
-- Note: This is only needed if the foreign key constraint is causing issues

-- Alternative policy that explicitly allows group_id updates:
-- DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
-- CREATE POLICY "Users can update their own habits"
--   ON habits
--   FOR UPDATE
--   USING (
--     auth.uid() = user_id AND
--     -- Allow update even if group_id references a group (foreign key will validate)
--     (group_id IS NULL OR EXISTS (
--       SELECT 1 FROM habit_groups 
--       WHERE id = habits.group_id 
--       AND user_id = auth.uid()
--     ))
--   )
--   WITH CHECK (
--     auth.uid() = user_id AND
--     -- Validate that if group_id is set, it belongs to the user
--     (group_id IS NULL OR EXISTS (
--       SELECT 1 FROM habit_groups 
--       WHERE id = habits.group_id 
--       AND user_id = auth.uid()
--     ))
--   );

-- Step 8: Verify SELECT policy exists (needed to read habits after update)
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'habits' AND cmd = 'SELECT';

-- If SELECT policy doesn't exist, create it:
-- CREATE POLICY "Users can view their own habits"
--   ON habits
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- Step 9: Grant necessary permissions (if needed)
-- GRANT UPDATE ON habits TO authenticated;
-- GRANT SELECT ON habits TO authenticated;

