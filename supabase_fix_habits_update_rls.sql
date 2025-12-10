-- Quick Fix: Update RLS Policy for Habits Table
-- Run this in Supabase SQL Editor to fix group_id update issues

-- Step 1: Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;

-- Step 2: Create new UPDATE policy that allows updating group_id
-- The key is that WITH CHECK only validates ownership, not the group_id reference
-- The foreign key constraint will handle group_id validation
CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 3: Verify the policy
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'habits' AND cmd = 'UPDATE';

-- The policy should show:
-- USING: auth.uid() = user_id
-- WITH CHECK: auth.uid() = user_id

