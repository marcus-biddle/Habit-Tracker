import { addHabit, getHabitGroupsByUserId } from '../../../api/supabase'
import { type Habit } from '../../../components/Tables/Habits/columns'
import { useAuth } from '../../../context/AuthContext'
import { Plus } from 'lucide-react'
import { useState, type Dispatch, useEffect, useMemo } from 'react'
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
  SheetTrigger,
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
import { TZDate } from '@date-fns/tz';
import { toast } from 'sonner'

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

const formTemplate: Omit<Habit, "id" | "created_at" | "updated_at" | "user_id"> = {
  name: "",
  description: "",
  status: 'active',
  unit: "times",
  frequency: "daily",
  goal: 1,
  reminder_time: null,
  is_archived: false,
  tracking_type: "count",
  goal_period: "per_day",
  min_value: null,
  max_value: null,
  unit_display: null,
};

type HabitCreateSheetProps = {
  isOpen: (open: boolean) => void;
  open?: boolean;
  setHabits: Dispatch<any>;
};

export function HabitCreateSheet({ isOpen, open, setHabits }: HabitCreateSheetProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<Habit, "id" | "created_at" | "updated_at" | "user_id">>(formTemplate);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; color?: string | null }>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        const userGroups = await getHabitGroupsByUserId(user.id);
        setGroups(userGroups);
      }
    };
    if (open) {
      fetchGroups();
    }
  }, [user, open]);

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
    } else if (form.tracking_type === 'custom') {
      setForm(prev => ({ ...prev, unit: form.unit || '' }));
    }
  }, [form.tracking_type]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name || form.name.trim() === '') {
      toast.error("Habit name is required");
      return;
    }

    // Validate goal
    if (form.tracking_type !== 'binary' && (!form.goal || form.goal <= 0)) {
      toast.error("Goal must be greater than 0");
      return;
    }

    // Validate min/max
    if (form.min_value !== null && form.min_value !== undefined && 
        form.max_value !== null && form.max_value !== undefined && 
        form.min_value > form.max_value) {
      toast.error("Minimum value cannot be greater than maximum value");
      return;
    }

    // Validate unit for non-binary, non-custom types
    if (form.tracking_type && form.tracking_type !== 'binary' && form.tracking_type !== 'custom' && !form.unit) {
      toast.error("Unit is required");
      return;
    }

    const today = new TZDate().toISOString().split('T')[0];

    // Validate group_id if provided
    let validGroupId: string | null = null;
    if (selectedGroupId) {
      const groupExists = groups.some(g => g.id === selectedGroupId);
      if (!groupExists) {
        toast.error("Selected group does not exist. Please refresh and try again.");
        return;
      }
      validGroupId = selectedGroupId;
    }

    try {
      await addHabit({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        status: "active",
        unit: form.unit || 'times',
        frequency: form.frequency || 'daily',
        goal: form.goal || 1,
        reminder_time: null,
        is_archived: false,
        group_id: validGroupId,
        tracking_type: form.tracking_type || 'count',
        goal_period: form.goal_period || 'per_day',
        min_value: form.min_value,
        max_value: form.max_value,
        unit_display: form.unit_display?.trim() || null,
      });
      setHabits((prev: any[]) => [...prev, { ...form, created_at: today, group_id: selectedGroupId }]);
      isOpen(false);
      setSelectedGroupId(null);
      setForm(formTemplate);
      toast.success("Successfully added a new habit.");
    } catch (error) {
      console.error("Failed to create habit:", error);
      toast.error("Failed to create habit. Please try again.");
    }
  };

  // Determine if this is controlled (open prop provided) or uncontrolled
  const isControlled = open !== undefined
  
  return (
    <Sheet open={isControlled ? open : undefined} onOpenChange={isOpen}>
      {/* Only show trigger when uncontrolled */}
      {!isControlled && (
        <SheetTrigger asChild>
          <Button variant="outline"><Plus /> Habit</Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Create a new Habit</SheetTitle>
            <SheetDescription>
              Fill out the form here. Click create when you're done.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
            <div className="w-full space-y-6">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Habit Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="ex. Drink more water"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <FieldDescription>
                      Choose the name of your new habit.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Optionally include a brief description..."
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
                        <RadioGroupItem value="binary" id="track-binary" />
                        <FieldLabel htmlFor="track-binary" className="font-normal">
                          Yes/No (Completed or not)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="count" id="track-count" />
                        <FieldLabel htmlFor="track-count" className="font-normal">
                          Count (times, reps, items)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="duration" id="track-duration" />
                        <FieldLabel htmlFor="track-duration" className="font-normal">
                          Duration (minutes, hours)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="distance" id="track-distance" />
                        <FieldLabel htmlFor="track-distance" className="font-normal">
                          Distance (miles, km)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="weight" id="track-weight" />
                        <FieldLabel htmlFor="track-weight" className="font-normal">
                          Weight (lbs, kg)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="volume" id="track-volume" />
                        <FieldLabel htmlFor="track-volume" className="font-normal">
                          Volume (cups, liters)
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="custom" id="track-custom" />
                        <FieldLabel htmlFor="track-custom" className="font-normal">
                          Custom
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                  </FieldSet>

                  {form.tracking_type !== 'binary' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="unit">Unit</FieldLabel>
                          {form.tracking_type === 'custom' ? (
                            <Input
                              id="unit"
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
                          <FieldLabel htmlFor="goal">Goal</FieldLabel>
                          <Input
                            id="goal"
                            name="goal"
                            type="number"
                            min={1}
                            step={form.tracking_type === 'duration' ? 1 : form.tracking_type === 'weight' || form.tracking_type === 'distance' ? 0.1 : 1}
                            value={form.goal || ''}
                            onChange={handleChange}
                            required
                            placeholder="1"
                          />
                          <FieldDescription>
                            Target value to achieve.
                          </FieldDescription>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="unit_display">Custom Unit Display (Optional)</FieldLabel>
                        <Input
                          id="unit_display"
                          name="unit_display"
                          type="text"
                          placeholder="e.g., glasses (instead of cups)"
                          value={form.unit_display || ''}
                          onChange={handleChange}
                        />
                        <FieldDescription>
                          Optional custom name to display instead of the unit (e.g., "glasses" instead of "cups").
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
                        <RadioGroupItem value="per_day" id="period-day" />
                        <FieldLabel htmlFor="period-day" className="font-normal">
                          Per Day
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="per_week" id="period-week" />
                        <FieldLabel htmlFor="period-week" className="font-normal">
                          Per Week
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="per_month" id="period-month" />
                        <FieldLabel htmlFor="period-month" className="font-normal">
                          Per Month
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                  </FieldSet>

                  {form.tracking_type !== 'binary' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="min_value">Min Value (Optional)</FieldLabel>
                        <Input
                          id="min_value"
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
                        <FieldLabel htmlFor="max_value">Max Value (Optional)</FieldLabel>
                        <Input
                          id="max_value"
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

                  <Field>
                    <FieldLabel htmlFor="group">Habit Group (Optional)</FieldLabel>
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
                </FieldGroup>
              </FieldSet>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 bg-background border-t px-6 py-4 mt-auto">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Create Habit</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
