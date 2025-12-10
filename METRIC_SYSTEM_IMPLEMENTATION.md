# Enhanced Metric System Implementation

This document describes the implementation of the enhanced metric system for habits, providing better tracking types, standardized units, and improved goal management.

## Overview

The new system replaces the simple "unit" and "goal" fields with a comprehensive tracking system that supports:
- **7 tracking types**: Binary, Count, Duration, Distance, Weight, Volume, and Custom
- **Standardized units** based on tracking type
- **Goal periods**: Per day, per week, or per month
- **Optional validation**: Min/max values
- **Custom display names**: e.g., "glasses" instead of "cups"

## Database Changes

### Migration File: `supabase_metric_system_migration.sql`

Run this SQL migration in your Supabase SQL editor to add the new columns and migrate existing data.

**New Columns Added:**
- `tracking_type` (VARCHAR(20)): Type of tracking (binary, count, duration, distance, weight, volume, custom)
- `goal_period` (VARCHAR(20)): Period for goal (per_day, per_week, per_month)
- `min_value` (NUMERIC(10, 2)): Optional minimum value for validation
- `max_value` (NUMERIC(10, 2)): Optional maximum value for validation
- `unit_display` (VARCHAR(50)): Custom display name for unit

**Data Migration:**
- Existing habits are automatically migrated based on their current `unit` values
- `goal_period` is set based on existing `frequency` values
- `tracking_type` defaults to 'count' if not determinable
- Binary habits automatically get `goal = 1`

## TypeScript Type Updates

The `Habit` type in `frontend/app/components/Tables/Habits/columns.tsx` has been updated to include:
```typescript
tracking_type?: "binary" | "count" | "duration" | "distance" | "weight" | "volume" | "custom" | null;
goal_period?: "per_day" | "per_week" | "per_month" | null;
min_value?: number | null;
max_value?: number | null;
unit_display?: string | null;
```

## Component Updates

### HabitCreateSheet
- **Tracking Type Selector**: First field, determines available units
- **Dynamic Unit Selector**: Changes based on tracking type
- **Goal Period**: Replaces frequency for goal context (per day/week/month)
- **Goal Value**: Numeric input with appropriate step values
- **Min/Max Values**: Optional validation fields
- **Custom Unit Display**: Optional custom name for display

### HabitEditSheet
- Same fields as HabitCreateSheet
- Pre-populated with existing habit data
- Maintains backward compatibility with old habits

## Tracking Types and Units

### Binary (Yes/No)
- **Units**: N/A
- **Goal**: Always 1 (completed) or 0 (not completed)
- **Example**: "Meditate", "Take vitamins"

### Count
- **Units**: times, items, reps, sets, chapters, pages
- **Goal**: Number of times
- **Example**: "Do 10 push-ups", "Read 3 chapters"

### Duration
- **Units**: minutes, hours, seconds
- **Goal**: Time value
- **Example**: "Exercise for 30 minutes", "Meditate for 20 minutes"

### Distance
- **Units**: miles, kilometers, meters, feet
- **Goal**: Distance value
- **Example**: "Run 5 miles", "Walk 10,000 steps"

### Weight
- **Units**: pounds, kilograms, grams, ounces
- **Goal**: Weight value
- **Example**: "Lift 100 lbs", "Lose 2 lbs"

### Volume
- **Units**: ounces, cups, liters, milliliters, gallons
- **Goal**: Volume value
- **Example**: "Drink 8 glasses of water", "Drink 2 liters"

### Custom
- **Units**: Free text input
- **Goal**: Numeric value
- **Example**: "Score 8/10", "Pages read"

## Backward Compatibility

### Existing Habits
- All existing habits are automatically migrated
- Old `unit` and `frequency` fields are preserved
- New fields have sensible defaults
- No data loss occurs

### API Functions
- `addHabit()` and `updateHabit()` automatically handle new fields
- No changes needed to existing API calls
- New fields are optional, so old code continues to work

### Display Components
- Components that display habits will need updates to use `unit_display` if provided
- Otherwise, they can fall back to `unit` field

## Usage Examples

### Creating a Binary Habit
1. Select "Yes/No (Completed or not)" tracking type
2. Goal is automatically set to 1
3. No unit needed

### Creating a Volume Habit
1. Select "Volume (cups, liters)" tracking type
2. Choose unit (e.g., "cups")
3. Set goal (e.g., 8)
4. Optionally set custom display (e.g., "glasses")
5. Set goal period (e.g., "Per Day")

### Creating a Custom Habit
1. Select "Custom" tracking type
2. Enter custom unit (e.g., "points")
3. Set goal (e.g., 100)
4. Set goal period

## Migration Steps

1. **Run SQL Migration**: Execute `supabase_metric_system_migration.sql` in Supabase SQL editor
2. **Deploy Frontend**: The updated components are ready to use
3. **Verify Data**: Check that existing habits were migrated correctly
4. **Test**: Create and edit habits with new tracking types

## Notes

- The `frequency` field is kept for backward compatibility but `goal_period` is preferred
- The `unit` field is kept but `unit_display` should be used for display when available
- Min/max values are optional and can be NULL
- All new fields are optional to maintain backward compatibility

