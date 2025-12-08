import React, { useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from '../components/ui/button'
import Papa from 'papaparse';
import { Input } from '../components/ui/input';
import { CircleAlert, CircleCheckBig, NotebookPenIcon, SquareCheck, SquareChevronRightIcon, Upload } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import type { Habit } from '../components/Tables/Habits/columns';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/client/client';



type CSVImportProps = {
  habits: Habit[]
}

const CSVImporter = ({habits} : CSVImportProps) => {
  const { user } = useAuth();
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [userInput, setUserInput] = useState('');

  const importHabitEntries = async(csvData: any[]) => {
    if (!user) return;

  const validEntries = csvData
    .map(row => {

      const value = Number(row.value);
      if (isNaN(value) || value <= 0) {
        console.warn(`Skipping invalid value: ${row.value}`);
        return null;
      }

      return {
        date: row.date,
        habit_name: activeHabit ? activeHabit.name : userInput,
        value: value,      
        notes: `CSV Import`
      };
    })
    .filter((entry: any): entry is NonNullable<typeof entry> => entry !== null);

    // console.log(validEntries)
    const { data, error } = await supabase.rpc('import_habit_entries', {
      p_user_id: user.id,
      p_entries: validEntries
    });

    console.log(data, error)

}

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results: Papa.ParseResult<unknown>) => {
        const csvData = results.data as Array<{
          date: string;
          habit_name: string;
          value: number;
          notes?: string;
        }>;

        // await importHabits(csvData);
        await importHabitEntries(csvData);
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger>
        {/* <Button variant={'secondary'}>Import</Button> */}
        Import
      </SheetTrigger>
      <SheetContent className=' w-xl max-w-full'>
        <SheetHeader>
          <SheetTitle>Import your CSV.</SheetTitle>
          <Separator />
          <div className='space-y-8 mt-4'>
            <div className='space-y-2'>
              <Label>Habit Name</Label>
              <div className='flex w-full items-center gap-2'>
                  {activeHabit || userInput !== '' ? <CircleCheckBig className='text-green-500' /> : <CircleAlert />}
                  <div className='relative w-full'>
                    <Input placeholder='Habit name' value={activeHabit ? activeHabit.name : userInput} onChange={(e) => {
                      setActiveHabit(null)
                      setUserInput(e.target.value)
                    }} className='' />
                    <Sheet>
                      <SheetTrigger>
                        <div className='absolute right-1 size-7 top-1/2 -translate-y-1/2 bg-slate-900 rounded-md text-white items-center flex justify-center'>
                          <NotebookPenIcon className='size-5' />
                        </div>
                      </SheetTrigger>
                      <SheetContent className=''>
                          <SheetHeader>
                          <SheetTitle>Select a habit to reference your import.</SheetTitle>
                          <Separator />
                          <SheetClose asChild>
                            <div className='space-y-4'>
                            {habits && habits.map((habit, index) => (
                              <Card key={habit.id} className='p-2' onClick={() => setActiveHabit(habit)}>
                                <CardHeader className=''>
                                  <CardTitle>{habit.name}</CardTitle>
                                  <CardDescription className='text-xs'>{habit.id}</CardDescription>
                                  <CardAction className='h-full flex justify-center items-center'>
                                    {activeHabit && activeHabit.id === habit.id ? <SquareCheck className='text-green-500' /> : <SquareChevronRightIcon className='text-slate-700' />}
                                  </CardAction>
                                </CardHeader>
                              </Card>
                            ))}
                            </div>
                          </SheetClose>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                  </div>
              </div>
            </div>
            
            
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="csv">CSV File</Label>
              <Input
              id='csv'
              type="file" 
              accept=".csv" 
              disabled={!activeHabit && userInput === ''}
              onChange={handleFileUpload}
              className="file-input"
            />
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default CSVImporter