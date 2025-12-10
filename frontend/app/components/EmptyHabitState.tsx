import { useState } from "react"
import { Projector, Sparkles } from "lucide-react"

import { Button } from "./ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty"
import { Link } from "react-router"
import { PresetGroupsSheet } from "./Modals/Habits/PresetGroupsSheet"
import type { Habit } from "./Tables/Habits/columns"

interface EmptyHabitStateProps {
  habits?: Habit[]
  onSuccess?: () => void
}

export function EmptyHabitState({ habits = [], onSuccess }: EmptyHabitStateProps) {
  const [presetGroupsOpen, setPresetGroupsOpen] = useState(false)

  const handlePresetSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      // Default behavior: reload the page
      window.location.reload()
    }
    setPresetGroupsOpen(false)
  }

  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Projector />
          </EmptyMedia>
          <EmptyTitle>No Habits Yet</EmptyTitle>
          <EmptyDescription>
            Get started by creating your first habit or choosing a preset group
            to get you started quickly.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={'/dashboard/habits'} className="flex-1">
              <Button className="w-full">Create Habit</Button>
            </Link>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setPresetGroupsOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Choose Preset Group
            </Button>
          </div>
        </EmptyContent>
      </Empty>

      <PresetGroupsSheet
        open={presetGroupsOpen}
        onOpenChange={setPresetGroupsOpen}
        habits={habits}
        onSuccess={handlePresetSuccess}
      />
    </>
  )
}