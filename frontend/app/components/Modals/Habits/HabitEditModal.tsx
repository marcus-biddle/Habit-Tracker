import { type Habit, type HabitGroup } from '../../../components/Tables/Habits/columns'
import { getHabitGroupsByUserId } from '../../../api/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../../../components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Checkbox } from "../../../components/ui/checkbox"

type HabitEditModalProps = {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
};

export function HabitEditModal({ habit, open, onOpenChange, onSave }: HabitEditModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<Habit, "id" | "created_at" | "updated_at" | "user_id">>({
    name: habit.name,
    description: habit.description || "",
    status: habit.status,
    unit: habit.unit,
    frequency: habit.frequency || "daily",
    goal: habit.goal || 0,
    reminder_time: habit.reminder_time,
    is_archived: habit.is_archived,
    group_id: habit.group_id || null,
  });
  const [groups, setGroups] = useState<HabitGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(habit.group_id || null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        const userGroups = await getHabitGroupsByUserId(user.id);
        setGroups(userGroups);
      }
    };
    if (open) {
      fetchGroups();
      setSelectedGroupId(habit.group_id || null);
    }
  }, [user, open, habit.group_id]);

  useEffect(() => {
    if (open) {
      setForm({
        name: habit.name,
        description: habit.description || "",
        status: habit.status,
        unit: habit.unit,
        frequency: habit.frequency || "daily",
        goal: habit.goal || 0,
        reminder_time: habit.reminder_time,
        is_archived: habit.is_archived,
        group_id: habit.group_id || null,
      });
      setSelectedGroupId(habit.group_id || null);
    }
  }, [habit, open]);

  const handleFrequencyChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      frequency: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "goal" ? Number(value) : value,
    }));
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setForm(prev => ({
      ...prev,
      status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedHabit: Habit = {
      ...habit,
      ...form,
      group_id: selectedGroupId || null,
    };
    onSave(updatedHabit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full max-w-md">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-name">Habit Name</FieldLabel>
                  <Input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <FieldDescription>
                    The name of your habit.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                  <Textarea
                    id="edit-description"
                    name="description"
                    placeholder="Optional description..."
                    rows={4}
                    value={form.description || ""}
                    onChange={handleChange}
                  />
                </Field>
                <FieldSet>
                  <FieldLabel>Frequency Plan</FieldLabel>
                  <FieldDescription>
                    Select how frequent you plan to perform this habit.
                  </FieldDescription>
                  <RadioGroup
                    name="frequency"
                    value={form.frequency || "daily"}
                    onValueChange={handleFrequencyChange}
                    required
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="daily" id="edit-plan-daily" />
                      <FieldLabel htmlFor="edit-plan-daily" className="font-normal">
                        Daily
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="weekly" id="edit-plan-weekly" />
                      <FieldLabel htmlFor="edit-plan-weekly" className="font-normal">
                        Weekly
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="monthly" id="edit-plan-monthly" />
                      <FieldLabel htmlFor="edit-plan-monthly" className="font-normal">
                        Monthly
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit-goal">Frequency Goal</FieldLabel>
                    <Input
                      id="edit-goal"
                      name="goal"
                      type="number"
                      min={0}
                      value={form.goal || 0}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-unit">Unit To Measure</FieldLabel>
                    <Input
                      id="edit-unit"
                      name="unit"
                      type="text"
                      value={form.unit}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <FieldSet>
                  <FieldLabel>Status</FieldLabel>
                  <RadioGroup
                    value={form.status}
                    onValueChange={handleStatusChange}
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="active" id="edit-status-active" />
                      <FieldLabel htmlFor="edit-status-active" className="font-normal">
                        Active
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="inactive" id="edit-status-inactive" />
                      <FieldLabel htmlFor="edit-status-inactive" className="font-normal">
                        Inactive
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>
                <Field>
                  <FieldLabel htmlFor="edit-group">Habit Group (Optional)</FieldLabel>
                  <Select value={selectedGroupId || "none"} onValueChange={(value) => setSelectedGroupId(value === "none" ? null : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No group</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center gap-2">
                            {group.color && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: group.color }}
                              />
                            )}
                            <span>{group.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Optionally assign this habit to a group for better organization.
                  </FieldDescription>
                </Field>
                <Field orientation="horizontal" className="items-center gap-2">
                  <Checkbox
                    id="edit-archived"
                    checked={form.is_archived}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, is_archived: !!checked }))
                    }
                  />
                  <FieldLabel htmlFor="edit-archived" className="font-normal cursor-pointer">
                    Archive this habit
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

