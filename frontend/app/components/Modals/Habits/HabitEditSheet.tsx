import { type Habit, type HabitGroup } from '../../../components/Tables/Habits/columns'
import { getHabitGroupsByUserId } from '../../../api/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect, useMemo } from 'react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet"
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
import { Checkbox } from "../../../components/ui/checkbox"

// Unit options based on tracking type
const UNIT_OPTIONS: Record<string, string[]> = {
  binary: [],
  count: ['times', 'items', 'reps', 'sets', 'chapters', 'pages'],
  duration: ['minutes', 'hours', 'seconds'],
  distance: ['miles', 'kilometers', 'meters', 'feet'],
  weight: ['pounds', 'kilograms', 'grams', 'ounces'],
  volume: ['ounces', 'cups', 'liters', 'milliliters', 'gallons'],
  custom: [],
};

type HabitEditSheetProps = {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
};

export function HabitEditSheet({ habit, open, onOpenChange, onSave }: HabitEditSheetProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<Habit, "id" | "created_at" | "updated_at" | "user_id">>({
    name: habit.name,
    description: habit.description || "",
    status: habit.status,
    unit: habit.unit,
    frequency: habit.frequency || "daily",
    goal: habit.goal || 1,
    reminder_time: habit.reminder_time,
    is_archived: habit.is_archived,
    group_id: habit.group_id || null,
    tracking_type: habit.tracking_type || 'count',
    goal_period: habit.goal_period || (habit.frequency === 'daily' ? 'per_day' : habit.frequency === 'weekly' ? 'per_week' : 'per_month'),
    min_value: habit.min_value || null,
    max_value: habit.max_value || null,
    unit_display: habit.unit_display || null,
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
        goal: habit.goal || 1,
        reminder_time: habit.reminder_time,
        is_archived: habit.is_archived,
        group_id: habit.group_id || null,
        tracking_type: habit.tracking_type || 'count',
        goal_period: habit.goal_period || (habit.frequency === 'daily' ? 'per_day' : habit.frequency === 'weekly' ? 'per_week' : 'per_month'),
        min_value: habit.min_value || null,
        max_value: habit.max_value || null,
        unit_display: habit.unit_display || null,
      });
      setSelectedGroupId(habit.group_id || null);
    }
  }, [habit, open]);

  // Get available units based on tracking type
  const availableUnits = useMemo(() => {
    const trackingType = form.tracking_type || 'count';
    return UNIT_OPTIONS[trackingType] || [];
  }, [form.tracking_type]);

  // Reset unit when tracking type changes
  useEffect(() => {
    if (form.tracking_type && form.tracking_type !== 'custom' && form.tracking_type !== 'binary') {
      const units = UNIT_OPTIONS[form.tracking_type] || [];
      if (units.length > 0 && !units.includes(form.unit)) {
        setForm(prev => ({ ...prev, unit: units[0] }));
      }
    } else if (form.tracking_type === 'binary') {
      setForm(prev => ({ ...prev, unit: '', goal: 1 }));
    }
  }, [form.tracking_type, form.unit]);

  const handleTrackingTypeChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      tracking_type: value as Habit['tracking_type'],
    }));
  };

  const handleGoalPeriodChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      goal_period: value as Habit['goal_period'],
      // Also update frequency for backward compatibility
      frequency: value === 'per_day' ? 'daily' : value === 'per_week' ? 'weekly' : 'monthly',
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "goal" || name === "min_value" || name === "max_value"
          ? (value === '' ? null : Number(value))
          : value,
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
    
    // Validate goal
    if (form.tracking_type !== 'binary' && (!form.goal || form.goal <= 0)) {
      return;
    }

    // Validate min/max
    if (form.min_value !== null && form.max_value !== null && form.min_value > form.max_value) {
      return;
    }

    const updatedHabit: Habit = {
      ...habit,
      ...form,
      group_id: selectedGroupId || null,
    };
    onSave(updatedHabit);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Edit Habit</SheetTitle>
            <SheetDescription>
              Update your habit details below. Click save when you're done.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
            <div className="w-full space-y-6">
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
                      rows={3}
                      value={form.description || ""}
                      onChange={handleChange}
                    />
                  </Field>

                  <FieldSet>
                    <FieldLabel>Tracking Type</FieldLabel>
                    <FieldDescription>
                      Select how you want to track this habit.
                    </FieldDescription>
                    <RadioGroup
                      value={form.tracking_type || 'count'}
                      onValueChange={handleTrackingTypeChange}
                      required
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem value="binary" id="edit-track-binary" />
                        <FieldLabel htmlFor="edit-track-binary" className="font-normal">
                          Yes/No (Completed or not)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="count" id="edit-track-count" />
                        <FieldLabel htmlFor="edit-track-count" className="font-normal">
                          Count (times, reps, items)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="duration" id="edit-track-duration" />
                        <FieldLabel htmlFor="edit-track-duration" className="font-normal">
                          Duration (minutes, hours)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="distance" id="edit-track-distance" />
                        <FieldLabel htmlFor="edit-track-distance" className="font-normal">
                          Distance (miles, km)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="weight" id="edit-track-weight" />
                        <FieldLabel htmlFor="edit-track-weight" className="font-normal">
                          Weight (lbs, kg)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="volume" id="edit-track-volume" />
                        <FieldLabel htmlFor="edit-track-volume" className="font-normal">
                          Volume (cups, liters)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="custom" id="edit-track-custom" />
                        <FieldLabel htmlFor="edit-track-custom" className="font-normal">
                          Custom
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                  </FieldSet>

                  {form.tracking_type !== 'binary' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="edit-unit">Unit</FieldLabel>
                          {form.tracking_type === 'custom' ? (
                            <Input
                              id="edit-unit"
                              name="unit"
                              type="text"
                              placeholder="e.g., points, score"
                              value={form.unit || ''}
                              onChange={handleChange}
                              required
                            />
                          ) : (
                            <Select
                              value={form.unit || availableUnits[0]}
                              onValueChange={(value) => setForm(prev => ({ ...prev, unit: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FieldDescription>
                            Unit of measurement for this habit.
                          </FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="edit-goal">Goal</FieldLabel>
                          <Input
                            id="edit-goal"
                            name="goal"
                            type="number"
                            min={1}
                            step={form.tracking_type === 'duration' ? 1 : form.tracking_type === 'weight' || form.tracking_type === 'distance' ? 0.1 : 1}
                            value={form.goal || ''}
                            onChange={handleChange}
                            required
                          />
                          <FieldDescription>
                            Target value to achieve.
                          </FieldDescription>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="edit-unit_display">Custom Unit Display (Optional)</FieldLabel>
                        <Input
                          id="edit-unit_display"
                          name="unit_display"
                          type="text"
                          placeholder="e.g., glasses (instead of cups)"
                          value={form.unit_display || ''}
                          onChange={handleChange}
                        />
                        <FieldDescription>
                          Optional custom name to display instead of the unit.
                        </FieldDescription>
                      </Field>
                    </>
                  )}

                  <FieldSet>
                    <FieldLabel>Goal Period</FieldLabel>
                    <FieldDescription>
                      How often should this goal be achieved?
                    </FieldDescription>
                    <RadioGroup
                      value={form.goal_period || 'per_day'}
                      onValueChange={handleGoalPeriodChange}
                      required
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem value="per_day" id="edit-period-day" />
                        <FieldLabel htmlFor="edit-period-day" className="font-normal">
                          Per Day
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="per_week" id="edit-period-week" />
                        <FieldLabel htmlFor="edit-period-week" className="font-normal">
                          Per Week
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="per_month" id="edit-period-month" />
                        <FieldLabel htmlFor="edit-period-month" className="font-normal">
                          Per Month
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                  </FieldSet>

                  {form.tracking_type !== 'binary' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="edit-min_value">Min Value (Optional)</FieldLabel>
                        <Input
                          id="edit-min_value"
                          name="min_value"
                          type="number"
                          step={form.tracking_type === 'weight' || form.tracking_type === 'distance' ? 0.1 : 1}
                          value={form.min_value || ''}
                          onChange={handleChange}
                          placeholder="No minimum"
                        />
                        <FieldDescription>
                          Optional minimum allowed value.
                        </FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="edit-max_value">Max Value (Optional)</FieldLabel>
                        <Input
                          id="edit-max_value"
                          name="max_value"
                          type="number"
                          step={form.tracking_type === 'weight' || form.tracking_type === 'distance' ? 0.1 : 1}
                          value={form.max_value || ''}
                          onChange={handleChange}
                          placeholder="No maximum"
                        />
                        <FieldDescription>
                          Optional maximum allowed value.
                        </FieldDescription>
                      </Field>
                    </div>
                  )}

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
          </div>

          <SheetFooter className="sticky bottom-0 bg-background border-t px-6 py-4 mt-auto">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Changes</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
