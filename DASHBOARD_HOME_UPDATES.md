# Dashboard Home Updates for Enhanced Metric System

This document describes the updates made to the dashboard home page to support the new enhanced metric system.

## Overview

The dashboard home page has been updated to properly handle:
- **7 tracking types**: Binary, Count, Duration, Distance, Weight, Volume, Custom
- **Goal periods**: Per day, per week, per month
- **Custom unit display**: Shows `unit_display` when available, falls back to `unit`
- **Binary habits**: Special handling for yes/no habits
- **Improved progress calculations**: Based on tracking type and goal period

## Files Updated

### 1. Utility Functions (`frontend/app/components/Home/utils/habitCalculations.ts`)
**New file created** with helper functions:
- `getEffectiveGoal(habit)`: Returns the effective goal based on tracking type
- `isGoalMet(habit, currentValue)`: Checks if goal is met
- `calculateProgress(habit, currentValue)`: Calculates progress percentage
- `getDisplayUnit(habit)`: Returns unit_display or unit
- `getGoalPeriodText(goalPeriod)`: Returns formatted goal period text
- `formatValue(habit, value)`: Formats value based on tracking type

### 2. Stats Hook (`frontend/app/components/Home/hooks/useHomeStats.ts`)
**Updated** to use new metric system:
- Progress calculations now use `calculateProgress()` function
- Goal completion checks use `isGoalMet()` function
- Binary habits are properly handled (goal = 1, completed if value >= 1)
- Group stats and ungrouped stats updated
- Today stats properly count habits at goal (not just with entries)

### 3. HabitCard Component (`frontend/app/components/Home/HabitCard.tsx`)
**Major updates**:
- Displays `unit_display` when available
- Shows goal period context (e.g., "per week")
- Binary habits show "Completed" or "Not completed" instead of numbers
- Quick update buttons handle binary habits (toggle 0/1)
- Manual edit popover handles binary vs. quantitative differently
- Respects min/max values for input validation
- Shows effective goal instead of raw goal

### 4. TodaysHabitsCarousel (`frontend/app/components/Home/TodaysHabitsCarousel.tsx`)
**Updated**:
- Uses `calculateProgress()` for progress calculation
- Passes correct data to HabitCard

### 5. HabitGroupsSection (`frontend/app/components/Home/HabitGroupsSection.tsx`)
**Updated**:
- Uses new utility functions for progress and goal calculations
- Displays unit_display when available
- Handles binary habits in expanded view
- Shows effective goal instead of raw goal

### 6. HabitGridCard (`frontend/app/components/HabitsOverview/HabitGridCard.tsx`)
**Updated**:
- Shows tracking_type badge
- Shows goal_period badge (if not per_day)
- Displays unit_display when available
- Shows effective goal with proper formatting
- Handles binary habits in goal display

## Key Features

### Binary Habits
- Display: Shows "Completed" or "Not completed" instead of numbers
- Quick Update: Toggle button (0 ↔ 1)
- Manual Edit: Button to toggle completion status
- Goal: Always 1 (automatically set)

### Goal Periods
- **Per Day**: Standard daily tracking
- **Per Week**: Goal applies to weekly total
- **Per Month**: Goal applies to monthly total
- Display: Shows goal period context (e.g., "8 cups (per week)")

### Custom Unit Display
- Uses `unit_display` when available
- Falls back to `unit` if `unit_display` is not set
- Example: Shows "glasses" instead of "cups"

### Progress Calculations
- Binary: 100% if value >= 1, 0% otherwise
- Quantitative: (currentValue / effectiveGoal) * 100
- Capped at 100% maximum
- Accounts for goal_period in calculations

## Display Examples

### Binary Habit
```
Meditate
Completed ✓
[Toggle Button]
```

### Volume Habit with Custom Display
```
Drink Water
8 / 8 glasses (per day)
[Progress Bar: 100%]
```

### Weekly Goal Habit
```
Exercise
15 / 20 miles (per week)
[Progress Bar: 75%]
```

## Backward Compatibility

- All existing habits continue to work
- Defaults to 'count' tracking type if not set
- Defaults to 'per_day' goal_period if not set
- Falls back to `unit` if `unit_display` is not available
- Progress calculations work with old habits

## Testing Checklist

- [ ] Binary habits display correctly
- [ ] Quantitative habits show proper units
- [ ] Custom unit_display appears when set
- [ ] Goal periods display correctly
- [ ] Progress bars calculate correctly
- [ ] Quick update buttons work for all types
- [ ] Manual edit handles binary vs. quantitative
- [ ] Group stats calculate correctly
- [ ] Today stats count habits at goal properly
- [ ] Streaks work with new system

