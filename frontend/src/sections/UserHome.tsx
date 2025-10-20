import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GoogleSheetApi } from '../api/GoogleSheetsAPI';
import { MultiDateSelector } from '../components/MultiDateSelector';

export type SheetEntry = {
  sheet: string;
  date: string | null;
  value: string | null;
};

type DailyReqProps = {
    stats: SheetEntry[]
}

const formattedSheet = {
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
    console.log(stats, "AHHHHH")
    return (
        <div className='flex flex-col justify-center items-left w-full'>
            <h2 className='uppercase'>GOALS</h2>
            <code className=' m-2'>Complete daily tasks. </code>
            <div className='bg-white/10 flex justify-center rounded-lg w-full'>
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
                                    {key}
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

export type FormattedDate = {
    text: string;
    month: string;
    day: string;
    year: string;
}

export function getFormattedDate(month?: number, day?: number, year?: number): FormattedDate {
  const today = new Date();

  // Use provided values or fallback to today's components
  const m = month ?? today.getMonth(); // Months are zero-based
  const d = day ?? today.getDate();
  const y = year ?? today.getFullYear();

  // Format with leading zeros
  const formattedMonth = m.toString().padStart(2, "0");
  const formattedDay = d.toString().padStart(2, "0");
  const formattedYear = y.toString(); // Last two digits

  return { text:`${formattedMonth}/${formattedDay}/${formattedYear.slice(-2)}`, month: formattedMonth, day: formattedDay, year: formattedYear };
}

function isSameDate(date1: string, date2?: string): boolean {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date(); // default to today if not provided

  // Compare only year, month, and day (ignore time zone/time)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

type UserSelectionProps = {
    userList: string[];
    totalUsers: number;
    activeUser: string;
    setActiveUser: (user: string) => void;
}
const UserSelection = ({ userList, totalUsers, activeUser, setActiveUser }: UserSelectionProps) => {
    return (
        <div className='w-full space-y-4'>
            <h4 className=' uppercase'>total users: <code className='text-xl'>{totalUsers}</code></h4>
            <ul className='grid grid-cols-4 gap-2'>
                {userList.map((user, index) => (
                    <li key={index}>
                        <button onClick={() => setActiveUser(user)} className={`w-full ${user === activeUser ? 'bg-slate-500 text-slate-800 font-bold' : 'bg-white/10'} py-2 px-4 rounded-sm`}>{user}</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

type userStatsData = {
    success: boolean;
    users: string[];
    totalUsers: number;
}

const UserHome = () => {
    const [activeUser, setActiveUser] = useState('Cal');
    const [userDataList, setUserDataList] = useState<userStatsData>({
        success: false,
        users: [],
        totalUsers: 0
    });
    const [userStats, setUserStats] = useState<SheetEntry[]>([]);
    const [date, selectedDate] = useState<FormattedDate>(getFormattedDate());
    const [todaysStats, setTodaysStats] = useState<SheetEntry[]>([]);

    const fetchUserNames = async () => {
        const userNameData: userStatsData = await GoogleSheetApi.getUserList('Users');
        setUserDataList(userNameData);
        console.log(userNameData)
    };

    const getDailyStats = () => {
        console.log('getDailyStats - userStats', userStats, date.text)
        const dailyStats = userStats.filter((entry: any) => isSameDate(entry.date, date.text));
        console.log('getDailyStats', dailyStats)
        setTodaysStats(dailyStats);
    }

    const fetchUserStats = async () => {
        const userStatsData = await GoogleSheetApi.getUserStats(activeUser);
        console.log(userStatsData)
        setUserStats(userStatsData.data);
    }

    useEffect(() => {
        fetchUserNames();
        fetchUserStats();
      }, [activeUser]);

    useEffect(() => {
        getDailyStats();
    }, [date, userStats])

  return (
    <div className='relative space-y-10 flex flex-col justify-center items-center'>
        <TimeTracker />
        <MultiDateSelector rawData={userStats} selectedDate={selectedDate} date={date} />
        <UserSelection userList={userDataList.users} totalUsers={userDataList.totalUsers} activeUser={activeUser} setActiveUser={setActiveUser} />
        <Progress progress={calculateProgress(todaysStats)} />
        <DailyRequirements stats={todaysStats} />
    </div>
  )
}

export default UserHome