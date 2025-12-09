import { supabase } from "../api/client/client";
import type { Habit, HabitGroup } from "../components/Tables/Habits/columns";

type HabitInsert = Omit<Habit, "id" | "created_at" | "updated_at">;
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

export async function updateHabit(habitId: string, updates: Partial<HabitInsert>) {
  // Ensure group_id is either a valid UUID string or null (not empty string)
  const updateData: Partial<HabitInsert> = {
    ...updates,
  };
  
  // Only set group_id if it's explicitly provided in updates
  if ('group_id' in updates) {
    let groupId: string | null = updates.group_id && updates.group_id.trim() !== '' ? updates.group_id : null;
    
    // If a group_id is provided, verify it exists and belongs to the user
    if (groupId) {
      // First, get the habit to get the user_id
      const { data: habit, error: habitError } = await supabase
        .from("habits")
        .select("user_id")
        .eq("id", habitId)
        .single();
      
      if (habitError || !habit) {
        throw new Error("Habit not found");
      }
      
      // Now verify the group exists and belongs to the user
      const { data: group, error: groupError } = await supabase
        .from("habit_groups")
        .select("id")
        .eq("id", groupId)
        .eq("user_id", habit.user_id)
        .single();
      
      if (groupError || !group) {
        console.error("Group validation failed:", groupError?.message || "Group not found");
        throw new Error(`The selected group no longer exists or doesn't belong to you. Please select a different group or leave it ungrouped.`);
      }
    }
    
    updateData.group_id = groupId;
  }

  const { data, error } = await supabase
    .from("habits")
    .update(updateData)
    .eq("id", habitId)
    .select();

  if (error) {
    console.error("Error updating habit:", error.message);
    // Provide more context for foreign key errors
    if (error.message.includes("foreign key constraint")) {
      console.error("Group ID causing issue:", updateData.group_id);
      throw new Error(`Invalid group selected. Please select a valid group or leave it ungrouped.`);
    }
    throw error;
  }

  return data?.[0];
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