import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { Habit } from "@/components/Tables/Habits/columns";
import { addHabit } from "@/api/supabse";
import { useAuth } from "@/context/AuthContext";

type HabitModalProps = {
  onOpen: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<Habit[] | []>>
};

export function HabitModal({ onOpen, setData }: HabitModalProps) {
    const { user } = useAuth();
  const [form, setForm] = useState<Omit<Habit, "id" | "created_at" | "updated_at" | "user_id">>({
    name: "",
    description: "",
    status: "active",
    unit: "",
    frequency: "",
    goal: null,
    reminder_time: null,
    is_archived: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "goal" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setData([])
    addHabit({...form, user_id: user.id})
    onOpen(false);
  };

  return (
    <Card className="w-full z-90 min-h-[600px] bg-slate-300 border border-slate-200 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus />
          <span>New Habit</span>
        </CardTitle>
        <CardDescription>
          Fill out the form to add a new habit to track.
        </CardDescription>
        <CardAction>
          <Button onClick={() => onOpen(false)} variant="outline" size={"icon"}>
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Habit name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Description (optional)"
              value={form.description || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              name="unit"
              type="text"
              placeholder="Unit of measurement"
              value={form.unit}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input
              id="frequency"
              name="frequency"
              type="text"
              placeholder="How often (e.g. daily, weekly)"
              value={form.frequency || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              name="goal"
              type="number"
              placeholder="Goal (numeric)"
              value={form.goal ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* <div className="grid gap-2">
            <Label htmlFor="reminder_time">Reminder Time</Label>
            <Input
              id="reminder_time"
              name="reminder_time"
              type="time"
              placeholder="HH:mm:ss"
              value={form.reminder_time || ""}
              onChange={handleChange}
            />
          </div> */}
          <Button type="submit" className="mt-4 w-full">
            Add Habit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
