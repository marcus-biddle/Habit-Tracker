import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MultiDateSelector } from '../components/MultiDateSelector';
import { useActiveUser } from '../context/ActiveUserContext';
import { ActionsOverview } from '../components/ActionsOverview';
import { WeeklyWorkoutFrequencyChart } from '../components/Charts/WeeklyWorkoutFrequencyChart';
import { TotalVolumeChart } from '../components/Charts/TotalVolumeChart';
import { ExerciseProgressionChart } from '../components/Charts/ExerciseProgressionChart';
import { ConsistencyStreaksChart } from '../components/Charts/ConsistencyStreaksChart';
import { ExerciseVarietyChart } from '../components/Charts/ExerciseVarietyChart';
import { BodyMeasurementsChart } from '../components/Charts/BodyMeasurementChart';
import { Grid, Box } from "@mui/material";
import { Filter, PlusCircleIcon } from 'lucide-react';
import SimpleDropdown from '../components/Mui/Dropdown';
import BasicGrid from '../components/Mui/BasicGrid';

export type SheetEntry = {
  sheet: string;
  date: string | null;
  value: string | null;
};

type FormatSheet = { push: string; pull: string; run: string; }

type DailyReqProps = {
    stats: SheetEntry[]
}

const formattedSheet: FormatSheet = {
    push: 'Push-ups',
    pull: 'Pull-ups',
    run: 'Run'
}

type SheetKey = keyof typeof formattedSheet;

// need to create repGoals data
const repGoals: Record<string, number> = {
  push: 10,
  pull: 10,
  run: 10, // example rep goal, adjust as needed
};

function calculateProgress(entries: SheetEntry[]): number {
  const totalExercises = Object.keys(repGoals).length;

  // Sum progress for known exercises only
  const totalProgress = entries.reduce((sum, entry) => {
    if (!entry.value) return sum; // no reps done => 0 progress
    const goal = repGoals[entry.sheet.toLowerCase()]; // need to change this to use keys on formattedSheet
    if (!goal) return sum; // unknown exercise, ignore

    // convert value string to number, handle commas
    const repsDone = Number(entry.value.replace(/,/g, ""));
    if (isNaN(repsDone)) return sum;

    // progress capped at 1 per exercise
    const exerciseProgress = Math.min(repsDone / goal, 1);

    return sum + exerciseProgress;
  }, 0);

  // Normalize by total exercises to get 0-1 range
  return Math.min(totalProgress / totalExercises, 1);
}

const wasGoalCompleted = (sheetName: string, value: number) => {
    const isCompleted = repGoals[sheetName] < value;
    return isCompleted ? { text:'COMPLETED', isCompleted: true } : { text:'INCOMPLETED', isCompleted: false }
}

const DailyRequirements = ({ stats }: DailyReqProps) => {
    console.log('stats', stats)
    return (
        <div className='flex flex-col justify-center items-left w-full'>
            <h2 className='uppercase'>GOALS</h2>
            <code className=' m-2'>Complete daily tasks. </code>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50">
                <ul className='items-start justify-center space-y-2 p-4 w-full'>
                    {Object.entries(formattedSheet).map(([key, value], index) => {
                        const entry = stats.find(e => e.sheet.toLowerCase() === key) || null;
                        const isEntryNull = entry === null;
                        const goal = wasGoalCompleted(key, Number(isEntryNull ? 0 : entry.value));
                        return (
                            <li key={key} className={`w-full grid grid-cols-[min-content_1fr_min-content] gap-4 ${stats.length -1 === index ? '' : 'border-b border-white/10'} p-2 items-center`}>
                                <span className={`${goal.isCompleted ? 'text-green-800' : 'text-gray-500'} min-w-30 `}>
                                    [{goal.text}]
                                </span>
                                <span className="truncate capitalize">
                                    {formattedSheet[key as keyof FormatSheet]}
                                </span>
                                <span>{isEntryNull ? 0 : Number(entry.value)}/{repGoals[key]}</span>
                            </li>
                        )
                    })}
                    {/* <li className='w-full flex justify-between border-b border-white/10 p-2'>
                        <div className='flex gap-2'>
                            <span>[INCOMPLETE]</span>
                            <span>Run</span>
                        </div>
                        <span>0/10</span>
                    </li>
                    <li className='w-full flex justify-between border-b border-white/10 p-2'>
                        <div className='flex gap-2'>
                            <span>[INCOMPLETE]</span>
                            <span>Pushups</span>
                        </div>
                        <span>0/10</span>
                    </li>
                    <li className='w-full flex justify-between border-b border-white/10 p-2'>
                        <div className='flex gap-2'>
                            <span>[INCOMPLETE]</span>
                            <span>Pullups</span>
                        </div>
                        <span>0/10</span>
                    </li> */}
                    {/* <li className='w-full flex justify-between p-2'>
                        <div className='flex gap-2'>
                            <span>[INCOMPLETE]</span>
                            <span>Squats</span>
                        </div>
                        <span>0/10</span>
                    </li> */}
                </ul>
            </div>
        </div>
    )
}

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const day = currentTime.toLocaleDateString(undefined, { weekday: "long" });
  const date = currentTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = currentTime.toLocaleTimeString(undefined, { hour12: true });

  return (
    <div className="w-full flex justify-between items-center text-slate-500">
        <div>
            <div className="text-lg font-semibold">{day}</div>
            <div className="text-md mt-1 mb-2">{date}</div>
        </div>
        <div className="text-2xl font-mono">{time}</div>
    </div>
  );
};

interface ProgressProps {
  progress: number; // Value between 0 and 1
}

const Progress: React.FC<ProgressProps> = ({ progress }) => {
    console.log('progress is ', progress)
    const percentage = (progress * 100).toFixed(2);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full">
  <div className="relative col-span-1 h-1 bg-slate-800 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-cyan-600"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </div>
  <div className=' col-span-1'>{`${percentage}%`}</div>
</div>

    
  );
};

type UserSelectionProps = {
    userList: string[];
    totalUsers: number;
    activeUser: string;
    setActiveUser: (user: string) => void;
}

const UserHome = () => {
   const { date, selectedDate, actionsByDate, userActionList, user } = useActiveUser();
   console.log(date, actionsByDate, userActionList)
   const userWorkoutDates = [
  "2025-11-02T14:23:00.000Z",
  "2025-11-02T17:45:00.000Z",
  "2025-11-01T12:10:00.000Z",
  "2025-10-30T19:00:00.000Z",
  "2025-10-29T09:30:00.000Z",
  "2025-10-27T07:15:00.000Z"
];

const workoutEntries = [
  { date: "2025-11-01T10:00:00.000Z", sets: 4, reps: 8, weight: 100 },
  { date: "2025-11-01T10:00:00.000Z", sets: 3, reps: 10, weight: 80 },
  { date: "2025-11-03T12:30:00.000Z", sets: 5, reps: 5, weight: 120 },
  { date: "2025-11-05T09:15:00.000Z", sets: 4, reps: 6, weight: 110 },
  { date: "2025-11-05T09:15:00.000Z", sets: 3, reps: 12, weight: 60 },
];

const exerciseName = "Barbell Bench Press";
const entries = [
  { date: "2025-11-01T10:00:00.000Z", weight: 150, reps: 8 },
  { date: "2025-11-02T11:30:00.000Z", weight: 155, reps: 6 },
  { date: "2025-11-04T09:45:00.000Z", weight: 160, reps: 5 },
  { date: "2025-11-05T12:15:00.000Z", weight: 152.5, reps: 8 },
];

const workoutDates = [
  "2025-11-01T10:00:00.000Z",
  "2025-11-02T11:30:00.000Z",
  "2025-11-03T09:45:00.000Z",
  "2025-11-05T12:15:00.000Z",
  "2025-11-06T15:00:00.000Z",
  "2025-11-07T08:20:00.000Z",
];

const exerciseData = [
  { category: "Chest", count: 10 },
  { category: "Back", count: 7 },
  { category: "Legs", count: 5 },
  { category: "Shoulders", count: 4 },
];

const measurements = [
  { date: "2025-10-01T07:00:00.000Z", weight: 180, bodyFatPercent: 18.5 },
  { date: "2025-10-15T07:00:00.000Z", weight: 178, bodyFatPercent: 17.8 },
  { date: "2025-11-01T07:00:00.000Z", weight: 175, bodyFatPercent: 17.0 },
  { date: "2025-11-10T07:00:00.000Z", weight: 172, bodyFatPercent: 16.5 },
];


    // const getDailyStats = () => {
    //     const dailyStats = userStats.filter((entry: any) => isSameDate(entry.date, date.text));
    //     setTodaysStats(dailyStats);
    // }

    // const fetchUserStats = async () => {
    //     const userListData = await GoogleSheetApi.getUserStats(user ?? '');
    //     setUserStats(userListData.data);
    // }

    // useEffect(() => {
    //     fetchUserStats();
    // }, [user]);

    // useEffect(() => {
    //     getDailyStats();
    // }, [date, userStats])

    const gridItems = [
      { component: <WeeklyWorkoutFrequencyChart workoutDates={userWorkoutDates} />, size: 8 },
      { component: <ConsistencyStreaksChart workoutDates={workoutDates} />, size: 4 }
    ]

  return (
    <div className='w-full h-screen'>
      <div className='p-4 flex flex-col justify-center items-baseline gap-2 md:flex-row md:justify-between'>
        <h2 className='text-4xl'>{user}</h2>
        <div className='flex gap-4 justify-center items-center h-10'>
          <Filter className='size-8' />
          <SimpleDropdown />
          <button>
            <PlusCircleIcon className='size-8' />
          </button>
        </div>
      </div>
      <BasicGrid GridItems={gridItems} />


        {/* <TimeTracker />
        <ActionsOverview /> */}
        
        {/* <MultiDateSelector rawData={userActionList} selectedDate={selectedDate} date={date} /> */}
        {/* <UserSelection userList={userDataList.users} totalUsers={userDataList.totalUsers} activeUser={activeUser} setActiveUser={setActiveUser} /> */}
        {/* <Progress progress={calculateProgress(actionByDate)} /> */}
        {/* <DailyRequirements stats={actionByDate} /> */}
    </div>
  )
}

export default UserHome