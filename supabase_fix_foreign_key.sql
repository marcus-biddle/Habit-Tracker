-- Diagnostic and Fix Script for habit_groups Foreign Key Constraint
-- Run this in your Supabase SQL Editor to diagnose and fix the issue

-- Step 1: Check if the foreign key constraint exists and is correct
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'habits' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'group_id';

-- Step 2: Check for any habits with invalid group_ids (groups that don't exist)
SELECT 
    h.id as habit_id,
    h.name as habit_name,
    h.group_id,
    hg.id as group_exists
FROM habits h
LEFT JOIN habit_groups hg ON h.group_id = hg.id
WHERE h.group_id IS NOT NULL 
  AND hg.id IS NULL;

-- Step 3: If there are invalid group_ids, fix them by setting to NULL
-- UNCOMMENT THE FOLLOWING LINE TO FIX INVALID GROUP_IDS:
-- UPDATE habits SET group_id = NULL WHERE group_id IS NOT NULL AND group_id NOT IN (SELECT id FROM habit_groups);

-- Step 4: Drop and recreate the foreign key constraint to ensure it's correct
-- UNCOMMENT THE FOLLOWING LINES TO RECREATE THE CONSTRAINT:
/*
ALTER TABLE habits 
DROP CONSTRAINT IF EXISTS habits_group_id_fkey;

ALTER TABLE habits 
ADD CONSTRAINT habits_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES habit_groups(id) 
ON DELETE SET NULL;
*/

-- Step 5: Verify the constraint is working
-- Try to insert a habit with a non-existent group_id (should fail)
-- This is just for testing - don't run in production without proper test data
/*
INSERT INTO habits (user_id, name, status, unit, frequency, goal, is_archived, group_id)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with a valid user_id
  'Test Habit',
  'active',
  'test',
  'daily',
  1,
  false,
  'ffffffff-ffff-ffff-ffff-ffffffffffff' -- This should fail if constraint works
);
*/

-- Step 6: Check RLS policies on habit_groups table
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
WHERE tablename = 'habit_groups';

-- If RLS is blocking the query, you may need to check your RLS policies
-- The validation query in the frontend needs to be able to read habit_groups

