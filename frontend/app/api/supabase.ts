import { supabase } from "../api/client/client";
import type { Habit, HabitGroup } from "../components/Tables/Habits/columns";

export type HabitInsert = Omit<Habit, "id" | "created_at" | "updated_at">;
type HabitGroupInsert = Omit<HabitGroup, "id" | "created_at" | "updated_at">;
export type HabitEntryInsert = {
  user_id: string;
  habit_id: string;
  entry_date?: string;
  value: number;
  notes?: string;
};

export async function initializeSession() {
  // Set the timezone for this session (run once after login/refresh)
  const { error } = await supabase.rpc('set_config', {
    key: 'timezone',
    value: 'America/Los_Angeles', // Your timezone here
    is_local: true
  });

  if (error) {
    console.error('Failed to set timezone:', error);
  }
}

export const addHabit = async (habit: HabitInsert): Promise<void> => {
  // Ensure group_id is either a valid UUID string or null (not empty string)
  let groupId: string | null = null;
  
  if (habit.group_id) {
    const trimmed = habit.group_id.trim();
    // Basic UUID format validation (8-4-4-4-12 hex characters)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (trimmed !== '' && uuidRegex.test(trimmed)) {
      // If a group_id is provided, verify it exists and belongs to the user
      const { data: group, error: groupError } = await supabase
        .from("habit_groups")
        .select("id, user_id")
        .eq("id", trimmed)
        .eq("user_id", habit.user_id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when not found
      
      if (groupError) {
        console.error("Group validation query error:", groupError);
        throw new Error(`Error validating group: ${groupError.message}`);
      }
      
      if (!group) {
        console.error("Group validation failed: Group not found or doesn't belong to user", {
          groupId: trimmed,
          userId: habit.user_id
        });
        throw new Error(`The selected group no longer exists or doesn't belong to you. Please select a different group or leave it ungrouped.`);
      }
      
      groupId = trimmed;
    } else if (trimmed !== '') {
      console.error("Invalid UUID format for group_id:", trimmed);
      throw new Error(`Invalid group ID format. Please select a valid group or leave it ungrouped.`);
    }
  }

  const habitData = {
    ...habit,
    group_id: groupId,
  };

  console.log("Inserting habit with data:", { ...habitData, user_id: '[REDACTED]' });

  let { data, error } = await supabase
    .from("habits")
    .upsert([habitData], { onConflict: "user_id,name" })
    .select();

  if (error) {
    console.error("Error inserting/updating habit:", error.message);
    console.error("Habit data that failed:", { ...habitData, user_id: '[REDACTED]' });
    
    // If foreign key constraint error and we have a group_id, try again without the group
    if (error.message.includes("foreign key constraint") && habitData.group_id) {
      console.warn("Foreign key constraint error with group_id. Retrying without group...");
      
      // Double-check the group still exists
      const { data: verifyGroup } = await supabase
        .from("habit_groups")
        .select("id")
        .eq("id", habitData.group_id)
        .maybeSingle();
      
      console.error("Group verification after error:", verifyGroup ? "EXISTS" : "DOES NOT EXIST");
      
      // Retry without the group_id
      const habitDataWithoutGroup = {
        ...habitData,
        group_id: null,
      };
      
      const { data: retryData, error: retryError } = await supabase
        .from("habits")
        .upsert([habitDataWithoutGroup], { onConflict: "user_id,name" })
        .select();
      
      if (retryError) {
        console.error("Retry also failed:", retryError);
        throw retryError;
      }
      
      console.log("Successfully inserted habit without group after foreign key error");
      data = retryData;
      error = null;
      
      // Still throw an error to inform the user
      throw new Error(`The selected group is no longer valid. The habit was created without a group. Please assign it to a group manually.`);
    }
    
    if (error) {
      throw error;
    }
  }

  console.log("Inserted or updated habit:", data);
};

export async function getHabitsByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching habits:", error.message);
  }

  return data ?? [];
}

export async function addHabitEntry(entry: HabitEntryInsert) {
  const { data, error } = await supabase
    .from("habit_entries")
    .insert([
      {
        user_id: entry.user_id,
        habit_id: entry.habit_id,
        value: entry.value,
        entry_date: entry.entry_date,
        notes: entry.notes ?? null,
      },
    ]);

  if (error) {
    throw error;
  }

  // Award points for completing a habit (simple: 10 points per entry)
  try {
    await updateUserPoints(entry.user_id, 10);
    // Check for new achievements
    await checkAndUnlockAchievements(entry.user_id);
  } catch (pointsError) {
    // Don't fail the entry if points update fails
    console.error("Failed to update points:", pointsError);
  }

  return data;
}

export async function fetchHabitEntriesFor(userId: string, habitId: string) {
  const { data, error } = await supabase
    .from("habit_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_id", habitId);

  if (error) {
    console.error("Error fetching filtered habit entries:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteHabitEntries(idBatch: string[]) {
  const { data, error } = await supabase
  .from('habit_entries')
  .delete()
  .in('id', idBatch);

  if (error) {
    console.error('Delete error:', error);
  } else {
    console.log('Deleted entries', data);
  }
}

export async function deleteHabits(idBatch: string[]) {
  const { data, error } = await supabase
  .from('habits')
  .delete()
  .in('id', idBatch);

  if (error) {
    console.error('Delete error:', error);
  } else {
    console.log('Deleted entries', data);
  }
}

export async function fetchHabitNameById(habitId: string){
  const { data, error } = await supabase
    .rpc('get_habit_name_by_id', { habit_id: habitId })
    .single();

  if (error) {
    console.error('Error fetching habit name:', error.message);
    return null;
  }

  return data;
}

export async function updateHabit(userId: string, habitId: string, updates: Partial<HabitInsert>): Promise<Habit> {
  // Verify habit exists and belongs to user
  const { data: existingHabit, error: checkError } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) {
    throw new Error('Failed to verify habit');
  }

  if (!existingHabit) {
    throw new Error('Habit not found or you do not have permission to update it');
  }

  // Prepare update data
  const updateData: Partial<HabitInsert> = { ...updates };

  // Validate and process group_id if provided
  if ('group_id' in updates) {
    console.log('Processing group_id:', { 
      group_id: updates.group_id, 
      type: typeof updates.group_id,
      isString: typeof updates.group_id === 'string',
      trimmed: typeof updates.group_id === 'string' ? updates.group_id.trim() : 'N/A'
    });

    if (updates.group_id && typeof updates.group_id === 'string' && updates.group_id.trim() !== '') {
      const groupId = updates.group_id.trim();
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(groupId)) {
        throw new Error('Invalid group ID format');
      }

      // Verify group exists and belongs to user
      const { data: group, error: groupError } = await supabase
        .from("habit_groups")
        .select("id")
        .eq("id", groupId)
        .eq("user_id", userId)
        .maybeSingle();

      if (groupError) {
        console.error('Group verification error:', groupError);
        throw new Error('Failed to verify group');
      }

      if (!group) {
        console.error('Group not found:', { groupId, userId });
        throw new Error('The selected group does not exist or does not belong to you');
      }

      updateData.group_id = groupId;
      console.log('Group validated, setting group_id to:', groupId);
    } else {
      // Explicitly set to null to remove group assignment
      updateData.group_id = null;
      console.log('Setting group_id to null (removing group assignment)');
    }
  } else {
    console.log('group_id not in updates object');
  }

  console.log('Final updateData:', { ...updateData, group_id: updateData.group_id });

  // Perform the update WITHOUT select first (to avoid RLS blocking the entire operation)
  const { error: updateError } = await supabase
    .from("habits")
    .update(updateData)
    .eq("id", habitId)
    .eq("user_id", userId);

  console.log('Update query (without select) result:', { 
    error: updateError,
    errorCode: updateError?.code,
    errorMessage: updateError?.message
  });

  if (updateError) {
    if (updateError.code === "23503" || updateError.message.includes("foreign key constraint")) {
      throw new Error('Invalid group selected');
    }
    console.error('Update error:', updateError);
    throw updateError;
  }

  // Wait a moment for the update to complete
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Now fetch the updated habit to verify and return it
  const { data: updatedHabit, error: fetchError } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching updated habit:', fetchError);
    throw new Error('Habit was updated but could not be retrieved');
  }

  if (!updatedHabit) {
    throw new Error('Habit not found after update');
  }

  console.log('Fetched habit after update:', { 
    habitId: updatedHabit.id, 
    actualGroupId: updatedHabit.group_id,
    expectedGroupId: updateData.group_id 
  });

  // Verify the update actually happened by comparing group_id
  if ('group_id' in updateData) {
    const actualGroupId = updatedHabit.group_id;
    const expectedGroupId = updateData.group_id;
    
    // Compare group_ids (handle null/undefined)
    const actual = actualGroupId === null || actualGroupId === undefined ? null : String(actualGroupId);
    const expected = expectedGroupId === null || expectedGroupId === undefined ? null : String(expectedGroupId);
    
    if (actual !== expected) {
      console.error('Update verification failed:', {
        actual,
        expected,
        updateData,
        habitBeforeUpdate: existingHabit
      });
      throw new Error(`Update failed: group_id was not updated. Expected: ${expected}, Got: ${actual}. This may be due to Row Level Security policies blocking the update.`);
    }
    
    console.log('Update verified successfully - group_id matches');
  }

  return updatedHabit;
}

export async function getHabitsByUserIdWithGroups(user_id: string): Promise<Habit[]> {
  // Fetch habits (groups are fetched separately in the overview page)
  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching habits:", error.message);
    return [];
  }

  return (habits ?? []) as Habit[];
}

export async function updateHabitsBatch(habitIds: string[], updates: Partial<HabitInsert>) {
  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .in("id", habitIds)
    .select();

  if (error) {
    console.error("Error updating habits:", error.message);
    throw error;
  }

  return data;
}

// Habit Groups API Functions

export async function getHabitGroupsByUserId(user_id: string): Promise<HabitGroup[]> {
  const { data, error } = await supabase
    .from("habit_groups")
    .select("*")
    .eq("user_id", user_id)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching habit groups:", error.message);
    return [];
  }

  return data ?? [];
}

export async function addHabitGroup(group: HabitGroupInsert): Promise<HabitGroup> {
  const { data, error } = await supabase
    .from("habit_groups")
    .insert([group])
    .select()
    .single();

  if (error) {
    console.error("Error creating habit group:", error.message);
    throw error;
  }

  return data;
}

export async function updateHabitGroup(groupId: string, updates: Partial<HabitGroupInsert>): Promise<HabitGroup> {
  const { data, error } = await supabase
    .from("habit_groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (error) {
    console.error("Error updating habit group:", error.message);
    throw error;
  }

  return data;
}

export async function deleteHabitGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("habit_groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    console.error("Error deleting habit group:", error.message);
    throw error;
  }
}

export async function getHabitsWithGroups(user_id: string): Promise<(Habit & { group_name?: string | null; group_color?: string | null })[]> {
  const { data, error } = await supabase
    .from("habits")
    .select(`
      *,
      habit_groups:group_id (
        name,
        color
      )
    `)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching habits with groups:", error.message);
    return [];
  }

  // Transform the data to flatten the group information
  return (data ?? []).map((habit: any) => ({
    ...habit,
    group_name: Array.isArray(habit.habit_groups) && habit.habit_groups.length > 0 
      ? habit.habit_groups[0].name 
      : null,
    group_color: Array.isArray(habit.habit_groups) && habit.habit_groups.length > 0 
      ? habit.habit_groups[0].color 
      : null,
    habit_groups: undefined, // Remove the nested object
  }));
}

// Preset Groups API Functions

export async function importPresetGroup(
  userId: string, 
  presetGroup: { name: string; description: string; color?: string; habits: Omit<HabitInsert, 'user_id' | 'group_id'>[] }
): Promise<{ regrouped: number; created: number; skipped: number }> {
  // Check if a group with this name already exists
  const existingGroups = await getHabitGroupsByUserId(userId);
  let group: HabitGroup;
  let isExistingGroup = false;
  
  const existingGroup = existingGroups.find(g => g.name.toLowerCase() === presetGroup.name.toLowerCase());
  
  if (existingGroup) {
    // Use the existing group
    group = existingGroup;
    isExistingGroup = true;
  } else {
    // Try to create a new group with the exact name
    // If that fails due to unique constraint, try with a number suffix
    let groupName = presetGroup.name;
    let attempts = 0;
    let created = false;
    let createdGroup: HabitGroup | null = null;
    
    while (!created && attempts < 10) {
      try {
        createdGroup = await addHabitGroup({
          user_id: userId,
          name: groupName,
          description: presetGroup.description,
          color: presetGroup.color || null,
          display_order: 0,
        });
        created = true;
      } catch (error: any) {
        // If it's a unique constraint error, try with a different name
        if (error.code === '23505' && attempts < 10) {
          attempts++;
          groupName = `${presetGroup.name} (${attempts})`;
        } else {
          // Re-throw if it's not a unique constraint error or we've tried too many times
          throw error;
        }
      }
    }
    
    if (!created || !createdGroup) {
      throw new Error(`Unable to create group with name "${presetGroup.name}". Please try a different name.`);
    }
    
    group = createdGroup;
  }

  // Fetch existing habits for the user to check for duplicates
  const existingHabits = await getHabitsByUserId(userId);
  
  // Create a map of existing habits by name (case-insensitive) for quick lookup
  const existingHabitsMap = new Map<string, Habit>();
  existingHabits.forEach(habit => {
    const key = habit.name.toLowerCase().trim();
    existingHabitsMap.set(key, habit);
  });

  // Separate habits into those that need to be regrouped and those that need to be created
  const habitsToRegroup: Habit[] = [];
  const habitsToCreate: Omit<HabitInsert, 'user_id' | 'group_id'>[] = [];

  for (const presetHabit of presetGroup.habits) {
    const habitNameKey = presetHabit.name.toLowerCase().trim();
    const existingHabit = existingHabitsMap.get(habitNameKey);

    if (existingHabit) {
      // Habit already exists - check if it needs to be regrouped
      // Only regroup if it's not already in the target group
      if (existingHabit.group_id !== group.id) {
        habitsToRegroup.push(existingHabit);
      }
      // If it's already in the target group, skip it (no action needed)
    } else {
      // Habit doesn't exist - add it to the create list
      habitsToCreate.push(presetHabit);
    }
  }

  let regroupedCount = 0;
  let createdCount = 0;
  let skippedCount = 0;

  // Count habits that are already in the target group (skipped)
  for (const presetHabit of presetGroup.habits) {
    const habitNameKey = presetHabit.name.toLowerCase().trim();
    const existingHabit = existingHabitsMap.get(habitNameKey);
    if (existingHabit && existingHabit.group_id === group.id) {
      skippedCount++;
    }
  }

  // Regroup existing habits that match preset habits
  if (habitsToRegroup.length > 0) {
    const regroupPromises = habitsToRegroup.map(habit => 
      updateHabit(userId, habit.id, { group_id: group.id })
    );
    
    try {
      await Promise.all(regroupPromises);
      regroupedCount = habitsToRegroup.length;
      console.log(`Regrouped ${regroupedCount} existing habit(s) into "${group.name}"`);
    } catch (error: any) {
      console.error("Error regrouping existing habits:", error);
      // Don't throw here - we still want to create new habits even if regrouping fails
      // The error is logged for debugging, but we continue with creating new habits
    }
  }

  // Create new habits that don't exist yet
  if (habitsToCreate.length > 0) {
    const habitsToInsert = habitsToCreate.map(habit => ({
      ...habit,
      user_id: userId,
      group_id: group.id,
    }));

    const { error } = await supabase
      .from("habits")
      .insert(habitsToInsert);

    if (error) {
      console.error("Error importing preset group habits:", error.message);
      // Only try to clean up if we created a new group (not if using existing)
      if (!isExistingGroup) {
        try {
          await deleteHabitGroup(group.id);
        } catch (cleanupError) {
          console.error("Failed to clean up group after error:", cleanupError);
        }
      }
      throw error;
    }
    
    createdCount = habitsToCreate.length;
  }

  return {
    regrouped: regroupedCount,
    created: createdCount,
    skipped: skippedCount,
  };
}

// Gamification API Functions

export type UserProfile = {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  unlocked_at: string;
};

export async function getUserProfile(user_id: string): Promise<UserProfile | null> {
  // First, try to get existing profile
  let { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Error fetching user profile:", error.message);
    return null;
  }

  // If no profile exists, create one
  if (!data) {
    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert([{
        user_id: user_id,
        total_points: 0,
        current_level: 1,
      }])
      .select()
      .single();

    if (createError) {
      console.error("Error creating user profile:", createError.message);
      return null;
    }

    return newProfile;
  }

  return data;
}

export async function updateUserPoints(user_id: string, pointsToAdd: number): Promise<void> {
  // Get current profile
  const profile = await getUserProfile(user_id);
  if (!profile) {
    throw new Error("User profile not found");
  }

  const newPoints = profile.total_points + pointsToAdd;
  const newLevel = calculateLevel(newPoints);

  const { error } = await supabase
    .from("user_profiles")
    .update({
      total_points: newPoints,
      current_level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user_id);

  if (error) {
    console.error("Error updating user points:", error.message);
    throw error;
  }
}

export function calculateLevel(points: number): number {
  // Simple level calculation: Level 1 = 0-100, Level 2 = 101-300, Level 3 = 301-600, etc.
  // Each level requires more points than the previous
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 600) return 3;
  if (points < 1000) return 4;
  if (points < 1500) return 5;
  if (points < 2100) return 6;
  if (points < 2800) return 7;
  if (points < 3600) return 8;
  if (points < 4500) return 9;
  return 10 + Math.floor((points - 4500) / 1000);
}

export function getPointsForNextLevel(currentLevel: number): number {
  const levelThresholds: Record<number, number> = {
    1: 100,
    2: 300,
    3: 600,
    4: 1000,
    5: 1500,
    6: 2100,
    7: 2800,
    8: 3600,
    9: 4500,
  };
  
  if (currentLevel < 10) {
    return levelThresholds[currentLevel] || 4500 + (currentLevel - 9) * 1000;
  }
  return 4500 + (currentLevel - 9) * 1000;
}

export function getPointsForCurrentLevel(currentLevel: number): number {
  if (currentLevel === 1) return 0;
  return getPointsForNextLevel(currentLevel - 1);
}

export async function getAchievements(user_id: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user_id)
    .order("unlocked_at", { ascending: false });

  if (error) {
    console.error("Error fetching achievements:", error.message);
    return [];
  }

  return data ?? [];
}

export async function checkAndUnlockAchievements(user_id: string): Promise<Achievement[]> {
  const profile = await getUserProfile(user_id);
  if (!profile) return [];

  const { data: habits } = await supabase
    .from("habits")
    .select("id, created_at")
    .eq("user_id", user_id);

  const { data: entries } = await supabase
    .from("habit_entries")
    .select("entry_date")
    .eq("user_id", user_id)
    .order("entry_date", { ascending: true });

  const { data: stats } = await supabase.rpc('get_habit_dashboard_stats', {
    p_user_id: user_id
  });

  const newAchievements: Achievement[] = [];
  const existingAchievements = await getAchievements(user_id);
  const existingTypes = new Set(existingAchievements.map(a => a.achievement_type));

  // Check for "First Habit" achievement
  if (habits && habits.length > 0 && !existingTypes.has('first_habit')) {
    const { data: achievement } = await supabase
      .from("achievements")
      .insert([{
        user_id: user_id,
        achievement_type: 'first_habit',
      }])
      .select()
      .single();
    
    if (achievement) newAchievements.push(achievement);
  }

  // Check for "100 Points" achievement
  if (profile.total_points >= 100 && !existingTypes.has('100_points')) {
    const { data: achievement } = await supabase
      .from("achievements")
      .insert([{
        user_id: user_id,
        achievement_type: '100_points',
      }])
      .select()
      .single();
    
    if (achievement) newAchievements.push(achievement);
  }

  // Check for "500 Points" achievement
  if (profile.total_points >= 500 && !existingTypes.has('500_points')) {
    const { data: achievement } = await supabase
      .from("achievements")
      .insert([{
        user_id: user_id,
        achievement_type: '500_points',
      }])
      .select()
      .single();
    
    if (achievement) newAchievements.push(achievement);
  }

  // Check for "7 Day Streak" achievement
  if (stats && stats.length > 0) {
    const has7DayStreak = stats.some((stat: any) => stat.current_streak >= 7);
    if (has7DayStreak && !existingTypes.has('7_day_streak')) {
      const { data: achievement } = await supabase
        .from("achievements")
        .insert([{
          user_id: user_id,
          achievement_type: '7_day_streak',
        }])
        .select()
        .single();
      
      if (achievement) newAchievements.push(achievement);
    }
  }

  // Check for "30 Day Streak" achievement
  if (stats && stats.length > 0) {
    const has30DayStreak = stats.some((stat: any) => stat.current_streak >= 30);
    if (has30DayStreak && !existingTypes.has('30_day_streak')) {
      const { data: achievement } = await supabase
        .from("achievements")
        .insert([{
          user_id: user_id,
          achievement_type: '30_day_streak',
        }])
        .select()
        .single();
      
      if (achievement) newAchievements.push(achievement);
    }
  }

  // Check for "10 Habits" achievement
  if (habits && habits.length >= 10 && !existingTypes.has('10_habits')) {
    const { data: achievement } = await supabase
      .from("achievements")
      .insert([{
        user_id: user_id,
        achievement_type: '10_habits',
      }])
      .select()
      .single();
    
    if (achievement) newAchievements.push(achievement);
  }

  // Check for "100 Entries" achievement
  if (entries && entries.length >= 100 && !existingTypes.has('100_entries')) {
    const { data: achievement } = await supabase
      .from("achievements")
      .insert([{
        user_id: user_id,
        achievement_type: '100_entries',
      }])
      .select()
      .single();
    
    if (achievement) newAchievements.push(achievement);
  }

  return newAchievements;
}