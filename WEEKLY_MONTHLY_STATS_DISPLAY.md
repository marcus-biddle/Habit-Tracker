# Weekly and Monthly Stats Display on Home Page

## Overview
Enhanced the home page to better reflect and display weekly and monthly habit statistics, making it clear which habits are weekly/monthly and showing their progress separately.

## Changes Made

### 1. Enhanced Stats Calculations (`useHomeStats.ts`)
✅ **Added goal period breakdowns** to `TodayStats`:
- `dailyHabits`: Count and at-goal status for daily habits
- `weeklyHabits`: Count, at-goal status, average progress, and week completion %
- `monthlyHabits`: Count, at-goal status, average progress, and month completion %

**New calculations:**
- Separates habits by goal period (daily/weekly/monthly)
- Calculates completion rates for weekly/monthly habits separately
- Tracks average progress for each period type
- Uses period totals for accurate weekly/monthly calculations

### 2. New WeeklyMonthlyStatsCard Component
✅ **Created dedicated stats card** showing:
- **Weekly Habits Section:**
  - Total count of weekly habits
  - Week completion percentage (prominent display)
  - Number at goal this week
  - Average progress across weekly habits

- **Monthly Habits Section:**
  - Total count of monthly habits
  - Month completion percentage (prominent display)
  - Number at goal this month
  - Average progress across monthly habits

**Features:**
- Only displays if there are weekly/monthly habits
- Clean, organized layout with clear sections
- Uses Calendar icon for visual identification
- Links to habits management page

### 3. Updated Home Page (`home.tsx`)
✅ **Added WeeklyMonthlyStatsCard** to the stats grid:
- Positioned alongside other stat cards
- Displays after StreakPerformanceCard
- Responsive grid layout accommodates the new card

### 4. Enhanced HabitCard Display
✅ **Added visual badge** for weekly/monthly habits:
- Shows "Weekly" or "Monthly" badge next to habit name
- Styled with primary color and border
- Makes it immediately clear which habits are weekly/monthly
- Badge only appears for non-daily habits

## Visual Improvements

### Before:
- All habits shown together
- No distinction between daily/weekly/monthly
- Week completion was an average across all habits
- No dedicated weekly/monthly stats section

### After:
- ✅ Clear visual badges on weekly/monthly habits
- ✅ Dedicated stats card for weekly/monthly goals
- ✅ Separate completion tracking for each period type
- ✅ Better understanding of progress across different goal periods

## Files Changed

1. ✅ `frontend/app/components/Home/hooks/useHomeStats.ts`
   - Added goal period breakdown calculations
   - Updated `TodayStats` interface

2. ✅ `frontend/app/components/Home/StatsCards/WeeklyMonthlyStatsCard.tsx`
   - New component created

3. ✅ `frontend/app/components/Home/StatsCards/index.ts`
   - Added export for new card

4. ✅ `frontend/app/components/Home/index.ts`
   - Added export for new card

5. ✅ `frontend/app/pages/home.tsx`
   - Added WeeklyMonthlyStatsCard to display

6. ✅ `frontend/app/components/Home/HabitCard.tsx`
   - Added weekly/monthly badge indicator

## Display Examples

### WeeklyMonthlyStatsCard Display:

```
┌─────────────────────────────┐
│ Weekly & Monthly Goals  📅  │
├─────────────────────────────┤
│ Weekly Habits (3)     75% ↗ │
│ At goal this week: 2 / 3    │
│ Avg progress: 68%          │
│                             │
│ Monthly Habits (2)    45% ↗ │
│ At goal this month: 1 / 2  │
│ Avg progress: 42%           │
└─────────────────────────────┘
```

### HabitCard with Badge:

```
┌─────────────────────────────┐
│ Exercise [Weekly]        →  │
│ 15 / 20 miles (per week)    │
│ ████████░░ 75% complete     │
└─────────────────────────────┘
```

## Benefits

1. **Clear Visibility**: Users can immediately see which habits are weekly/monthly
2. **Better Tracking**: Separate stats for weekly/monthly progress
3. **Accurate Progress**: Uses period totals, not just today's values
4. **Organized Display**: Dedicated card keeps weekly/monthly stats together
5. **Quick Overview**: At-a-glance view of weekly/monthly goal completion

## Testing Checklist

- [ ] WeeklyMonthlyStatsCard appears when there are weekly/monthly habits
- [ ] Card is hidden when there are no weekly/monthly habits
- [ ] Weekly habits show correct week completion %
- [ ] Monthly habits show correct month completion %
- [ ] "At goal" counts are accurate for weekly/monthly habits
- [ ] HabitCard shows "Weekly" or "Monthly" badge correctly
- [ ] Badge only appears for non-daily habits
- [ ] Stats update correctly when habits are updated
- [ ] Card links to habits management page

## Next Steps

The home page now clearly displays weekly and monthly stats! Users can:
- See which habits are weekly/monthly at a glance
- Track weekly/monthly progress separately
- Understand their progress across different goal periods
- Get accurate completion rates for weekly/monthly goals

