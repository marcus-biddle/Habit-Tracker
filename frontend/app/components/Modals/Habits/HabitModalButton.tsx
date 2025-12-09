import { addHabit, getHabitGroupsByUserId } from '../../../api/supabase'
import { type Habit } from '../../../components/Tables/Habits/columns'
import { useAuth } from '../../../context/AuthContext'
import { Plus } from 'lucide-react'
import { useState, type Dispatch, useEffect } from 'react'
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
  DialogTrigger,
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
import { TZDate } from '@date-fns/tz';
import { toast } from 'sonner'

const formTemplate: Omit<Habit, "id" | "created_at" | "updated_at" | "user_id"> = {
        name: "ex. drink more water",
        description: "Optionally include a brief description...",
        status: 'active',
        unit: "unit",
        frequency: "daily",
        goal: 0,
        reminder_time: null,
        is_archived: false,
      };

type HabitModalProps = {
  isOpen: (open: boolean) => void;
  open: boolean;
  setHabits: Dispatch<any>;
};

export function HabitModalButton({ isOpen, open, setHabits }: HabitModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (form === formTemplate) return;
        const today = new TZDate().toISOString().split('T')[0];

        // Validate group_id if provided
        let validGroupId: string | null = null;
        if (selectedGroupId) {
            // Check if the selected group exists in the groups list
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
                name: form.name,
                description: form.description === "Optionally include a brief description..." ? '' : form.description,
                status: "active",
                unit: form.unit,
                frequency: form.frequency,
                goal: form.goal,
                reminder_time: null,
                is_archived: false,
                group_id: validGroupId,
            })
            setHabits((prev: any[]) => [...prev, {...form, created_at: today, group_id: selectedGroupId}])
            isOpen(false);
            setSelectedGroupId(null);
            setForm(formTemplate);

            toast.success("Successfully added a new habit.");
        } catch {
            toast.error("Failed to create.")
        }
      };

  return (
    <>
    <Dialog open={open} onOpenChange={isOpen}>
    <form>
    <DialogTrigger asChild>
    <Button variant="outline"><Plus /> Habit</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
    <DialogTitle>Create a new Habit.</DialogTitle>
    <DialogDescription>
    Fill out the form here. Click create when you're done.
    </DialogDescription>
    </DialogHeader>
    <div className="w-full max-w-md">
    <FieldSet>
    <FieldGroup>
    <Field>
    <FieldLabel htmlFor="name">Habit Name</FieldLabel>
    <Input id="name" name="name" type="text" placeholder="ex. drink more water" onChange={handleChange} required />
    <FieldDescription>
    Choose the name of your new habit.
    </FieldDescription>
    </Field>
    <Field>
    <FieldLabel htmlFor="feedback">Description</FieldLabel>
    <Textarea
    id="description"
    name="description"
    placeholder="Optionally include a brief description..."
    rows={4}
    onChange={handleChange}
    />
    </Field>
    <FieldSet>
    <FieldLabel>Frequency Plan</FieldLabel>
    <FieldDescription>
    Select how frequent you plan to perform this habit.
    </FieldDescription>
    <RadioGroup name='frequency' defaultValue="daily" onValueChange={handleFrequencyChange} required>
    <Field orientation="horizontal">
    <RadioGroupItem value="daily" id="plan-daily" />
    <FieldLabel htmlFor="plan-daily" className="font-normal">
    Daily
    </FieldLabel>
    </Field>
    <Field orientation="horizontal">
    <RadioGroupItem value="weekly" id="plan-weekly" />
    <FieldLabel htmlFor="plan-weekly" className="font-normal">
    Weekly
    </FieldLabel>
    </Field>
    <Field orientation="horizontal">
    <RadioGroupItem value="monthly" id="plan-monthly" />
    <FieldLabel htmlFor="plan-monthly" className="font-normal">
    Monthly
    </FieldLabel>
    </Field>
    </RadioGroup>
    </FieldSet>
    <div className="grid grid-cols-2 gap-4">
    <Field>
    <FieldLabel htmlFor="city">Frequency Goal</FieldLabel>
    <Input id="goal" name="goal" type="number" min={0} placeholder={'0'} onChange={handleChange} required />
    </Field>
    <Field>
    <FieldLabel htmlFor="unit">Unit To Measure</FieldLabel>
    <Input id="unit" name="unit" type="text" placeholder="ex. ounces or oz" onChange={handleChange} required />
    </Field>
    </div>
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
    <DialogFooter>
    <DialogClose asChild>
    <Button variant="outline">Cancel</Button>
    </DialogClose>
    <Button type="submit" onClick={handleSubmit}>Create Habit</Button>
    </DialogFooter>
    </DialogContent>
    </form>
    </Dialog>
    </>
  );
}
