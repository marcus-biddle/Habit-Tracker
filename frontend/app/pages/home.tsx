import React, { useEffect, useRef, useState } from 'react'
import { Separator } from "../components/ui/separator"
import { type Habit } from '../components/Tables/Habits/columns'
import { Button } from '../components/ui/button'
import { Calendar, Forward, Map, Plus, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addHabitEntry, getHabitsByUserId } from '../api/supabase'
import { motion } from 'framer-motion'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { CardContent } from '@mui/material'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Combobox } from '../components/ComboBox'
import { AlertDialogButton } from '../components/AlertDialogButton'
import { supabase } from '../api/client/client'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { TZDate } from '@date-fns/tz';
import { EmptyHabitState } from '../components/EmptyHabitState'
import { HabitCounter } from '../components/HabitCounter'
import { Carousel } from '../components/ui/carousel'
import { CarouselContent } from '../components/ui/carousel'
import { CarouselItem } from '../components/ui/carousel'

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

export const today = new TZDate().toISOString().split('T')[0];

export function formatHabitDate(habitDate: string) {
  const date = new TZDate(habitDate)

  const now = new TZDate()
  const startOfToday = new TZDate(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new TZDate(date.getFullYear(), date.getMonth(), date.getDate())

  const diffMs = startOfToday.getTime() - startOfTarget.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleString()
}

export default function home() {
  const { user } = useAuth();
  const [update, setUpdate] = useState(false);
  const [habit, selectHabit] = useState<string>('');
  const [value, selectValue] = useState<number>(0);
  const [data, setData] = useState<Habit[] | null>([])
  const [dailySums, setDailySums] = useState<{ id: string; value: 0 }[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habit,
        value: value,
        entry_date: today
      });
      
      setUpdate(false);
      toast.success("Successfully updated habit.")
    } catch (err) {
      console.error("Failed to add habit entry", err);
    }
  };

  const fetchHabitDailySum = async (habitId: string) => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_daily_habit_sum', {
      p_user_id: user.id,
      p_habit_id: habitId,
      p_date: today
    });

    if (error) {
      console.error("RPC call failed:", error);
      return 0;
    }

    return data;
  }

  const fetchAllSums = async (res: Habit[] | null) => {
  if (!res) return;

  const sums = await Promise.all(
    res.map(habit => fetchHabitDailySum(habit.id))
  );
  const dailySums = res.map((habit, idx) => ({
    id: habit.id,
    value: sums[idx],
  }));

  setDailySums(dailySums);
};

  const fetchData = async() => {
    
    if (!user) return;
    const res = await getHabitsByUserId(user.id);
    setData(res)
    fetchAllSums(res);
  }

  const setDate = (habitDate: string) => {
    const date = new TZDate(habitDate);
    return date.toLocaleString();
  }

  const handleCardExpansion = (id: string) => {
    if (expanded.includes(id)) {
      // setExpanded(prev => prev.filter(h => h === id))
    } else {
      setExpanded(prev => [...prev, id])
    }
  }

  useEffect(() => {
    fetchData();
  }, [user, update]);

  console.log(expanded)

  return (
    <div className="relative h-full flex flex-1 flex-col gap-4 p-4 pt-0 ">
      <div className="md:min-h-min">
        <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Home</h4>
        <p className="text-muted-foreground text-sm">
          View your habits and daily activity.
        </p>
      </div>
        <Separator className="my-4" />
      </div>
        <div className='w-full flex justify-end gap-2'>
          <Link to={'habits'}>
            <Button size={'sm'}>
              <Map />
              Habits
            </Button>
          </Link>
          <Button disabled={data?.length === 0} size={'sm'} onClick={() => setUpdate(!update)}>
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
                <AlertDialogButton buttonText='Update' type='submit' onContinue={() => formRef && formRef.current?.requestSubmit()} dialingDesc='Performing this cannot be undone.' />
                <Button variant="outline" className="w-full" onClick={() => setUpdate(false)}>
                  Cancel
                </Button>
              </CardFooter>
            </Card>
            </motion.div>
          )}
          <div className="">
            {data && data.length > 0 ? 
              <Carousel opts={{
                align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="p-3">
                  {data.map((habit, index) => {
                  const backendValue = dailySums.find(s => s.id === habit.id)
                  const isOpen = expanded.includes(habit.id)
                  return (
                    <CarouselItem key={index} onClick={() => handleCardExpansion(habit.id)} className={`${isOpen ? 'basis-6/7 lg:basis-1/3' : 'basis-7/8 lg:basis-1/3' }`}>
                        {backendValue && 
                        <>
                          {!isOpen ? 
                            <Card className='w-full shadow-lg rounded-md p-2'>
                              <CardAction className='flex'>
                                <div>
                                  <HabitCounter habitUnit={habit.unit} showActions={false} habitId={habit.id} backendValue={(backendValue.value)} goal={habit.goal ?? 1} />
                                </div>
                                <CardHeader className='m-0 p-0'>
                                  <CardTitle className='p-2'>{habit.name}</CardTitle>
                                  <div>
                                    <div className='flex items-center w-full'>
                                      <Button variant={'ghost'}>
                                        <TrendingUp />
                                      </Button>
                                      {/* <p className="text-muted-foreground text-sm font-light">Frequency</p> */}
                                      <span>{habit.frequency}</span>
                                    </div>
                                
                                    <div className='flex items-center w-full truncate'>
                                      <Button variant={'ghost'}>
                                        <Calendar />
                                      </Button>
                                      {/* <p className="text-muted-foreground text-sm font-light">Last Updated</p> */}
                                      <span>{formatHabitDate(habit.updated_at)}</span>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CardAction>
                            </Card> :
                            <Card className="relative capitalize shadow-lg">
                            <CardHeader>
                              <CardTitle>{habit.name}</CardTitle>
                              <CardDescription>
                                {habit.description === ''? `${habit.frequency} ${habit.goal} ${habit.unit}` : habit.description}
                              </CardDescription>
                              <CardAction>
                                <Link to={`habits/${habit.id}`}>
                                  <Button variant="secondary">
                                    <Forward />
                                  </Button>
                                </Link>
                              </CardAction>
                            </CardHeader>
                            <Separator />
                            <CardContent className='flex flex-col gap-4 justify-center items-center'>
                              {backendValue && <HabitCounter habitUnit={habit.unit} habitId={habit.id} backendValue={(backendValue.value)} goal={habit.goal ?? 1} />}
                            </CardContent>
                            <CardFooter className="flex flex-row justify-around items-center">
                                <div className='flex flex-col items-center w-full'>
                                  <Button variant={'ghost'}>
                                    <TrendingUp />
                                  </Button>
                                  <p className="text-muted-foreground text-sm font-light">Frequency</p>
                                  <span>{habit.frequency}</span>
                                </div>
                                
                                <div className='flex flex-col items-center w-full'>
                                  <Button variant={'ghost'}>
                                    <Calendar />
                                  </Button>
                                  <p className="text-muted-foreground text-sm font-light">Last Updated</p>
                                  <span>{formatHabitDate(habit.updated_at)}</span>
                                </div>
                                

                            </CardFooter>
                            </Card>
                          }
                        </>}
                    </CarouselItem>
                  )
                })}
                </CarouselContent>
              </Carousel>
              :
              <EmptyHabitState />
          }
            
            {/* <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" />
            <div className="bg-slate-300/50 aspect-video rounded-xl" /> */}
          </div>
    </div>
  )
}
