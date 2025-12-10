# Gamification System Implementation

This document describes the implementation of the gamification system for the Habit Tracker, which adds points, levels, and achievements to make habit tracking more engaging.

## Overview

The gamification system includes:
- **Points System**: Users earn 10 points for each habit entry they log
- **Level System**: Users level up based on their total points (Level 1 = 0-100, Level 2 = 101-300, etc.)
- **Achievements**: Users can unlock various achievements by reaching milestones

## Database Changes

### Migration File: `supabase_gamification_migration.sql`

Run this SQL migration in your Supabase SQL editor to create the necessary tables:

1. **`user_profiles` table**: Stores user points and current level
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, unique)
   - `total_points` (INTEGER, default 0)
   - `current_level` (INTEGER, default 1)
   - `created_at` and `updated_at` timestamps

2. **`achievements` table**: Stores unlocked achievements
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `achievement_type` (VARCHAR, e.g., 'first_habit', '100_points')
   - `unlocked_at` (TIMESTAMPTZ)
   - Unique constraint on (user_id, achievement_type)

3. **Automatic Profile Creation**: A trigger automatically creates a profile when a new user signs up

4. **Row Level Security (RLS)**: Policies ensure users can only access their own data

## Frontend Changes

### API Functions (`frontend/app/api/supabase.ts`)

New functions added:
- `getUserProfile(user_id)` - Fetch or create user profile
- `updateUserPoints(user_id, pointsToAdd)` - Award points and update level
- `calculateLevel(points)` - Calculate level based on points
- `getPointsForNextLevel(level)` - Get points needed for next level
- `getPointsForCurrentLevel(level)` - Get points for current level
- `getAchievements(user_id)` - Fetch all achievements for a user
- `checkAndUnlockAchievements(user_id)` - Check and unlock new achievements

Updated functions:
- `addHabitEntry()` - Now automatically awards 10 points and checks for achievements

### Profile Page (`frontend/app/pages/profile.tsx`)

New profile page that displays:
- User avatar and email
- Current level and total points
- Level progress bar
- Unlocked achievements
- All available achievements (locked and unlocked)

### Routes (`frontend/app/routes.ts`)

Added new route:
- `/dashboard/profile` - Profile page with gamification stats

### Sidebar (`frontend/app/components/app-sidebar.tsx`)

Added Profile link to the sidebar navigation.

### UI Components

- **Progress Component** (`frontend/app/components/ui/progress.tsx`): Simple progress bar component for level progress

## Achievement Types

The following achievements are available:

1. **First Steps** (`first_habit`) - Created your first habit
2. **Centurion** (`100_points`) - Earned 100 points
3. **Half Grand** (`500_points`) - Earned 500 points
4. **Week Warrior** (`7_day_streak`) - Maintained a 7-day streak
5. **Month Master** (`30_day_streak`) - Maintained a 30-day streak
6. **Habit Collector** (`10_habits`) - Created 10 habits
7. **Entry Expert** (`100_entries`) - Logged 100 habit entries

## Level System

Level progression:
- Level 1: 0-100 points
- Level 2: 101-300 points
- Level 3: 301-600 points
- Level 4: 601-1000 points
- Level 5: 1001-1500 points
- Level 6: 1501-2100 points
- Level 7: 2101-2800 points
- Level 8: 2801-3600 points
- Level 9: 3601-4500 points
- Level 10+: 4500+ points (each additional level requires 1000 more points)

## Usage

1. Run the SQL migration in Supabase
2. Users will automatically get a profile when they sign up (via trigger)
3. Points are automatically awarded when users log habit entries
4. Achievements are automatically checked and unlocked when relevant milestones are reached
5. Users can view their profile, points, level, and achievements on the Profile page

## Future Enhancements

Potential additions:
- Leaderboards
- Daily challenges
- Streak multipliers for bonus points
- Custom achievement types
- Badge collections
- Social sharing of achievements

