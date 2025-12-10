import { type HabitGroup } from '../../../components/Tables/Habits/columns'
import { useAuth } from '../../../context/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Sheet,
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
import { Textarea } from "../../../components/ui/textarea"
import { toast } from 'sonner'
import { addHabitGroup, updateHabitGroup } from '../../../api/supabase'

type HabitGroupSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: HabitGroup | null; // If provided, we're editing; otherwise, creating
  onSuccess: () => void;
};

export function HabitGroupSheet({ open, onOpenChange, group, onSuccess }: HabitGroupSheetProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6', // Default blue color
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (group) {
        // Editing existing group
        setForm({
          name: group.name,
          description: group.description || '',
          color: group.color || '#3B82F6',
        });
      } else {
        // Creating new group
        setForm({
          name: '',
          description: '',
          color: '#3B82F6',
        });
      }
    }
  }, [open, group]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user) {
      toast.error("You must be logged in to create a group");
      return;
    }
    
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (group) {
        // Update existing group
        await updateHabitGroup(group.id, {
          user_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color || null,
        });
        toast.success("Group updated successfully");
      } else {
        // Create new group
        await addHabitGroup({
          user_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color || null,
          display_order: 0,
        });
        toast.success("Group created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast.error(error?.message || "Failed to save group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>
                {group ? 'Edit Habit Group' : 'Create Habit Group'}
              </SheetTitle>
              <SheetDescription>
                {group 
                  ? 'Update your habit group details below.'
                  : 'Create a new group to organize your habits. For example, "Health Habits" or "Work Habits".'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
              <div className="w-full space-y-6">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="group-name">Group Name</FieldLabel>
                    <Input
                      id="group-name"
                      name="name"
                      type="text"
                      placeholder="e.g., Health Habits"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <FieldDescription>
                      Choose a name for your habit group.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="group-description">Description (Optional)</FieldLabel>
                    <Textarea
                      id="group-description"
                      name="description"
                      placeholder="Optional description of this group..."
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="group-color">Color (Optional)</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        id="group-color"
                        name="color"
                        type="color"
                        value={form.color}
                        onChange={handleChange}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={form.color}
                        onChange={handleChange}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                    <FieldDescription>
                      Choose a color to visually identify this group.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
              </div>
            </div>
            
            <SheetFooter className="sticky bottom-0 bg-background border-t px-6 py-4 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={(e) => {
                  // Handle click directly to ensure it works even if form submission is prevented
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                {isSubmitting ? 'Saving...' : group ? 'Save Changes' : 'Create Group'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
    </Sheet>
  );
}

