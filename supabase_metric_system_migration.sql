-- Migration: Enhanced Metric System for Habits
-- This migration adds improved tracking types, goal periods, and unit management

-- Step 1: Add new columns to habits table
ALTER TABLE habits
ADD COLUMN IF NOT EXISTS tracking_type VARCHAR(20) DEFAULT 'count',
ADD COLUMN IF NOT EXISTS goal_period VARCHAR(20) DEFAULT 'per_day',
ADD COLUMN IF NOT EXISTS min_value NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS max_value NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS unit_display VARCHAR(50);

-- Step 2: Add constraints for data validation
ALTER TABLE habits
ADD CONSTRAINT IF NOT EXISTS check_tracking_type 
    CHECK (tracking_type IN ('binary', 'count', 'duration', 'distance', 'weight', 'volume', 'custom')),
ADD CONSTRAINT IF NOT EXISTS check_goal_period 
    CHECK (goal_period IN ('per_day', 'per_week', 'per_month')),
ADD CONSTRAINT IF NOT EXISTS check_goal_positive 
    CHECK (goal IS NULL OR goal >= 0),
ADD CONSTRAINT IF NOT EXISTS check_min_max 
    CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value);

-- Step 3: Migrate existing data to new system
-- Infer tracking_type from existing unit values
UPDATE habits
SET tracking_type = CASE
    WHEN unit ILIKE '%minute%' OR unit ILIKE '%hour%' OR unit ILIKE '%second%' OR unit ILIKE '%min%' OR unit ILIKE '%hr%' THEN 'duration'
    WHEN unit ILIKE '%mile%' OR unit ILIKE '%km%' OR unit ILIKE '%kilometer%' OR unit ILIKE '%meter%' OR unit ILIKE '%step%' OR unit ILIKE '%ft%' OR unit ILIKE '%foot%' THEN 'distance'
    WHEN unit ILIKE '%pound%' OR unit ILIKE '%kg%' OR unit ILIKE '%kilogram%' OR unit ILIKE '%gram%' OR unit ILIKE '%lb%' OR unit ILIKE '%lbs%' OR unit ILIKE '%g%' THEN 'weight'
    WHEN unit ILIKE '%ounce%' OR unit ILIKE '%oz%' OR unit ILIKE '%cup%' OR unit ILIKE '%liter%' OR unit ILIKE '%litre%' OR unit ILIKE '%ml%' OR unit ILIKE '%milliliter%' OR unit ILIKE '%glass%' OR unit ILIKE '%gallon%' THEN 'volume'
    WHEN unit ILIKE '%time%' OR unit ILIKE '%rep%' OR unit ILIKE '%item%' OR unit ILIKE '%set%' OR unit ILIKE '%chapter%' OR unit ILIKE '%page%' THEN 'count'
    WHEN unit ILIKE '%yes%' OR unit ILIKE '%no%' OR unit ILIKE '%done%' OR unit ILIKE '%complete%' OR unit = 'unit' OR unit = '' THEN 'binary'
    ELSE 'count'
END
WHERE tracking_type IS NULL OR tracking_type = 'count';

-- Set goal_period based on existing frequency
UPDATE habits
SET goal_period = CASE
    WHEN frequency = 'daily' THEN 'per_day'
    WHEN frequency = 'weekly' THEN 'per_week'
    WHEN frequency = 'monthly' THEN 'per_month'
    ELSE 'per_day'
END
WHERE goal_period IS NULL;

-- Set unit_display to current unit value for backward compatibility
UPDATE habits
SET unit_display = unit
WHERE unit_display IS NULL AND unit IS NOT NULL;

-- For binary habits, set goal to 1 if not set
UPDATE habits
SET goal = 1
WHERE tracking_type = 'binary' AND (goal IS NULL OR goal = 0);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_tracking_type ON habits(tracking_type);
CREATE INDEX IF NOT EXISTS idx_habits_goal_period ON habits(goal_period);
CREATE INDEX IF NOT EXISTS idx_habits_tracking_goal ON habits(tracking_type, goal_period);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN habits.tracking_type IS 'Type of tracking: binary (yes/no), count, duration, distance, weight, volume, or custom';
COMMENT ON COLUMN habits.goal_period IS 'Period for goal: per_day, per_week, or per_month';
COMMENT ON COLUMN habits.min_value IS 'Optional minimum value for validation';
COMMENT ON COLUMN habits.max_value IS 'Optional maximum value for validation';
COMMENT ON COLUMN habits.unit_display IS 'Custom display name for unit (e.g., "glasses" instead of "cups")';

-- Step 6: Update existing functions if they reference unit/goal
-- Note: This is a placeholder - update any existing functions that need to use the new fields

-- Example: Update get_habit_dashboard_stats if it exists
-- (Check your existing functions and update accordingly)

-- Notes:
-- 1. Existing habits will be migrated automatically
-- 2. The unit column is kept for backward compatibility but unit_display is preferred
-- 3. tracking_type defaults to 'count' for new habits
-- 4. goal_period defaults to 'per_day' for new habits
-- 5. min_value and max_value are optional and can be NULL

