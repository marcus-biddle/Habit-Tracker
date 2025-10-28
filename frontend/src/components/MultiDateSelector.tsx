import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import {  type SheetEntry } from '../sections/UserHome';
import { getFormattedDate, type FormattedDate } from '../utils/time';

function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;

  const parts = dateStr.split('/'); // Expect MM/DD/YY
  if (parts.length !== 3) return null;

  let [monthStr, dayStr, yearStr] = parts;
  
  const month = parseInt(monthStr, 10) - 1; // zero-based
  const day = parseInt(dayStr, 10);
  
  // Convert 2-digit year to full year (assumes 2000-2099)
  let year = parseInt(yearStr, 10);
  year += (year < 100) ? 2000 : 0;

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return { year, month, day };
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const years = [2020, 2021, 2022, 2023, 2024];

type Props = {
    rawData: SheetEntry[];
    date: FormattedDate;
    selectedDate: (date: FormattedDate) => void;
}

export const MultiDateSelector = ({ 
    rawData,
    date,
    selectedDate
}: Props) => {
  const [selectedYear, setSelectedYear] = useState(Number(date.year));
  const [selectedMonth, setSelectedMonth] = useState(Number(date.month));
  const [selectedDay, setSelectedDay] = useState(Number(date.day));
  const [isOpen, setIsOpen] = useState(true);

// Parse raw data into a nested structure indexed by year, month, day
  const historicData = useMemo(() => {
    const data: Record<number, Record<number, Record<number, SheetEntry[]>>> = {};

    rawData.forEach((entry) => {
        const parsed = parseDate(entry.date || '');
        if (!parsed) {
        return;
        }
        if (!data[parsed.year]) data[parsed.year] = {};
        if (!data[parsed.year][parsed.month]) data[parsed.year][parsed.month] = {};
        if (!data[parsed.year][parsed.month][parsed.day]) data[parsed.year][parsed.month][parsed.day] = [];
        data[parsed.year][parsed.month][parsed.day].push(entry);
    });
    return data;
  }, []);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const handleChange = () => {
    const formattedDate : FormattedDate = getFormattedDate(selectedMonth+1, selectedDay, selectedYear)
    selectedDate(formattedDate)
  }

  useEffect(() => {
    handleChange();
  },[selectedMonth, selectedDay, selectedYear])

  return (
    <div className="w-full">
        <div className=' space-y-2'>
            {/* Year Slider */}
            <div className="">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600">Year</label>
                    <span className="text-sm font-bold text-blue-600">{selectedYear}</span>
                </div>
                <input
                    type="range"
                    min="2023"
                    max="2025"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            {/* Month Slider */}
            <div className="">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600">Month</label>
                    <span className="text-sm font-bold text-blue-600">{months[selectedMonth]}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="11"
                    value={selectedMonth}
                    onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    const newDaysInMonth = new Date(selectedYear, Number(e.target.value) + 1, 0).getDate();
                    if (selectedDay > newDaysInMonth) setSelectedDay(newDaysInMonth);
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            {/* Day Slider */}
            <div className="">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600">Day</label>
                    <span className="text-sm font-bold text-blue-600">{selectedDay}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max={daysInMonth}
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                />
            </div>
        </div>

    </div>
  );
}