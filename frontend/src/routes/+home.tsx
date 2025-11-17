import React, { useEffect, useRef, useState } from 'react'
import { ChartAreaInteractive } from "../components/ChartAreaInteractive"
import { ChartBarMultiple } from "../components/Charts/BarChartMultiple"
import { ChartPieSimple } from "../components/ChartPieSimple"
import { ChartRadialSimple } from "../components/ChartRadialSimple"
import { Separator } from "@/components/ui/separator"
import { DataTable } from '@/components/Tables/Habits/data-table'
import { columns, type Habit } from '@/components/Tables/Habits/columns'
import { Button } from '@/components/ui/button'
import { ChartArea, Map, Plus } from 'lucide-react'
import { HabitModal } from '@/components/Modals/Habits/habitModal'
import { useAuth } from '@/context/AuthContext'
import { getHabitsByUserId } from '@/api/supabse'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CardContent } from '@mui/material'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ComboBox'
import { AlertDialogButton } from '@/components/AlertDialogButton'

export const fakeHabits: Habit[] = [
  {
    id: "a68f1e3f-9c4e-4a7d-b8fa-2f8dcb7a4a01",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "Drink Water",
    description: "Drink at least 8 glasses of water daily.",
    status: "active",
    unit: "glasses",
    frequency: "daily",
    goal: 8,
    reminder_time: "08:00:00",
    is_archived: false,
    created_at: "2025-11-01T07:30:00.000Z",
    updated_at: "2025-11-15T12:00:00.000Z",
  },
  {
    id: "f72e3b7c-8a7f-434d-91bc-8749f789fa4d",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "Morning Jog",
    description: null,
    status: "active",
    unit: "minutes",
    frequency: "daily",
    goal: 30,
    reminder_time: null,
    is_archived: false,
    created_at: "2025-10-25T06:00:00.000Z",
    updated_at: "2025-11-14T09:00:00.000Z",
  },
  {
    id: "c3f8bcf1-23a0-4174-ae29-425d6bc4c6b2",
    user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
    name: "Read Books",
    description: "Read for at least 20 minutes a day.",
    status: "inactive",
    unit: "minutes",
    frequency: "daily",
    goal: 20,
    reminder_time: "20:00:00",
    is_archived: false,
    created_at: "2025-09-10T21:00:00.000Z",
    updated_at: "2025-10-01T11:30:00.000Z",
  },
  {
    id: "7d120b8a-564d-44cb-9f39-70e1336cb78e",
    user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
    name: "Meditation",
    description: "Meditate daily to improve focus and reduce stress.",
    status: "active",
    unit: "minutes",
    frequency: "daily",
    goal: 15,
    reminder_time: "07:30:00",
    is_archived: false,
    created_at: "2025-11-10T06:00:00.000Z",
    updated_at: "2025-11-15T08:45:00.000Z",
  },
  {
    id: "6c1a7d9b-63a6-4a2b-9043-94d7e7b9c953",
    user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
    name: "No Sugar",
    description: "Avoid sugary snacks and drinks.",
    status: "active",
    unit: "days",
    frequency: "weekly",
    goal: 7,
    reminder_time: null,
    is_archived: true,
    created_at: "2025-08-01T10:00:00.000Z",
    updated_at: "2025-09-01T15:00:00.000Z",
  },
];

export default function home() {
  const [update, setUpdate] = useState(true);
  const [habit, selectHabit] = useState<string>('');
  const [value, selectValue] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(habit, value);
    // create supabase table and connect to update with userID
  };

  return (
    <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
      <div className="md:min-h-min">
        <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Home</h4>
        <p className="text-muted-foreground text-sm">
          Your dashboard.
        </p>
      </div>
        <Separator className="my-4" />
      </div>
        <div className='w-full flex justify-end gap-2'>
          <Button size={'sm'}>
            <ChartArea />
            Graphs
          </Button>
          <Button size={'sm'}>
            <Map />
            Habits
          </Button>
          <Button size={'sm'} onClick={() => setUpdate(!update)}>
            <Plus />
            Update
          </Button>
        </div>
          {update && (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-slate-300/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"
    >
      <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Update your habits</CardTitle>
        <CardDescription>
          Select your habit and new score below. Hit save to complete the process.
        </CardDescription>
        {/* <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction> */}
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="habit">Your Habits</Label>
              <div className='relative w-full'>
                <Combobox onSelect={selectHabit} />
              </div>
              
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="value">How many units did you complete today?</Label>
              </div>
              <Input id="value" type="number" min={0} onChange={(e) => selectValue(Number(e.target.value) ?? 0)} required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <AlertDialogButton buttonText='Update' type='submit' formRef={formRef} dialingDesc='Performing this cannot be undone.' />
        <Button variant="outline" className="w-full" onClick={() => setUpdate(false)}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  )}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
          </div>
    </div>
  )
}
