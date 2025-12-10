# Weekly and Monthly Stats Handling - Current State Analysis

## Current Implementation

### Backend (SQL Function: `get_habit_dashboard_stats`)
✅ **Correctly handles weekly/monthly goals:**
- For **weekly goals**: Calculates if weekly sum (from start of week to current date) >= goal
- For **monthly goals**: Calculates if monthly sum (from start of month to current date) >= goal
- Returns `week_completion` as a **percentage**:
  - Weekly goals: `(weekly_sum / goal) * 100`
  - Monthly goals: `(monthly_sum / goal) * 100`
  - Daily goals: `(days_met_goal_this_week / 7) * 100`
- Returns `today_value` which is just today's daily sum

### Frontend (Current Issue)
❌ **Problem: Only uses today's value**
- `dailySums` array only contains **today's value** for each habit
- `isGoalMet(habit, currentValue)` compares `currentValue` (today's value) against the goal
- For weekly/monthly goals, this is **incorrect**:
  - Example: Weekly goal of "20 miles per week"
  - If you've run 15 miles this week (3 today, 5 yesterday, 7 the day before)
  - Frontend only sees today's 3 miles and compares 3 < 20 → shows as incomplete
  - Should compare weekly total 15 < 20 → shows as incomplete (but correctly)

## The Problem

**For weekly/monthly goals:**
- Frontend needs the **period total** (weekly or monthly sum), not just today's value
- Current code uses `dailySums` which only has today's value
- This causes incorrect progress calculations and completion status

## Solution Options

### Option 1: Add Period Totals to SQL Function (Recommended)
**Pros:**
- Most efficient (single query)
- Consistent with backend logic
- No additional frontend calculations

**Cons:**
- Requires SQL function update

**Implementation:**
1. Add `weekly_total` and `monthly_total` fields to `get_habit_dashboard_stats` return
2. Calculate period totals in SQL for habits with weekly/monthly goals
3. Update frontend to use period totals instead of daily values for weekly/monthly habits

### Option 2: Calculate Period Totals on Frontend
**Pros:**
- No SQL changes needed
- Can use existing `week_completion` percentage to work backwards

**Cons:**
- Less accurate (week_completion is rounded)
- Requires fetching entries for the period
- More complex frontend logic

**Implementation:**
1. For weekly/monthly habits, fetch entries for the period
2. Sum entries to get period total
3. Use period total for progress/completion calculations

### Option 3: Use week_completion Percentage (Not Recommended)
**Pros:**
- No additional queries

**Cons:**
- Inaccurate (rounded percentage)
- Can't display actual values
- Doesn't solve the core problem

## Recommended Solution

**Add period totals to the SQL function** and update frontend to use them:

1. **Update SQL function** to return:
   - `period_total`: The actual sum for the current period (weekly/monthly)
   - Keep `week_completion` for percentage display

2. **Update frontend utility functions**:
   - `getCurrentValue(habit, dailySums, stats)`: Returns period total for weekly/monthly, daily value for daily
   - Update `isGoalMet` and `calculateProgress` to use period totals

3. **Update useHomeStats**:
   - Use period totals from stats for weekly/monthly habits
   - Use daily values for daily habits

## Current Behavior Summary

| Goal Period | Backend Calculation | Frontend Display | Status |
|------------|---------------------|------------------|--------|
| **Daily** | ✅ Compares daily value to goal | ✅ Uses today's value | ✅ **Correct** |
| **Weekly** | ✅ Compares weekly sum to goal | ❌ Uses today's value | ❌ **Incorrect** |
| **Monthly** | ✅ Compares monthly sum to goal | ❌ Uses today's value | ❌ **Incorrect** |

## Next Steps

Would you like me to:
1. **Update the SQL function** to return period totals?
2. **Update the frontend** to use period totals for weekly/monthly goals?
3. **Both** - Complete fix for weekly/monthly stats?

