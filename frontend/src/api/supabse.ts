import { supabase } from "@/client/client";
import type { Habit } from "@/components/Tables/Habits/columns";

type HabitInsert = Omit<Habit, "id" | "created_at" | "updated_at">;

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

export async function getHabitsByUserId(user_id: string): Promise<Habit[] | null> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching habits:", error.message);
    return null;
  }

  return data ?? [];
}