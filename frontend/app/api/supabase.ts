import { supabase } from "../api/client/client";
import type { Habit } from "../components/Tables/Habits/columns";

type HabitInsert = Omit<Habit, "id" | "created_at" | "updated_at">;
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
  const { data, error } = await supabase
    .from("habits")
    .upsert([habit], { onConflict: "user_id,name" })
    .select();

  if (error) {
    console.error("Error inserting/updating habit:", error.message);
    throw error;
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
  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", habitId)
    .select();

  if (error) {
    console.error("Error updating habit:", error.message);
    throw error;
  }

  return data?.[0];
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