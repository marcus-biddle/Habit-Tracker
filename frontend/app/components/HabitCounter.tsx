import React, { useState } from 'react'
import { CircularProgress } from './CircularProgressBar'
import { Button } from './ui/button'
import { Minus, Plus } from 'lucide-react'
import { supabase } from '../api/client/client'
import { addHabitEntry } from '../api/supabase'
import { today } from '../pages/home'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

type HabitCounterProps = {
    backendValue: number
    goal: number
    habitId: string
    habitUnit: string
    showActions?: boolean
}

export const HabitCounter = ({
    backendValue,
    goal,
    habitId,
    habitUnit,
    showActions=true
}: HabitCounterProps) => {
    const { user } = useAuth();
    const [value, setValue] = useState(backendValue)
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setChanges] = useState(backendValue !== value)

    const incrementValue = () => {
        if (value < goal) {
            setValue(prev => Math.min(prev +1, goal))
        }

        setChanges(value +1 === backendValue ? false : true);
    }

    const decrementValue = () => {
        if (value > 0) {
            setValue(prev => Math.max(prev -1, 0))
        }

        setChanges(value -1 === backendValue ? false : true);
    }

    const handleUpdate = async() => {
        if (!user) return;
        setSaving(true);

        const newEntry = {
            user_id: user.id,
            habit_id: habitId,
            value: value - backendValue,
            entry_date: today,
            notes: 'quick add by increment/decrement button',
        }

        try {
            await addHabitEntry(newEntry)
            setSaving(false)
            setChanges(false)
        } catch (err) {
            toast.error('Failed to update. Please refresh or try again later.')
        }

        
    }

  return (
    <>
        <CircularProgress showGoal={false} unit={habitUnit} size={!showActions ? 130 : 175} value={value} goal={goal} />
        {showActions && <div className='flex gap-6'>
            <Button onClick={decrementValue} disabled={isSaving || value <= 0}>
            <Minus />
            </Button>
            <Button onClick={incrementValue} disabled={isSaving || value >= goal}>
            <Plus />
            </Button>
        </div>}
        <div className='w-full'>
            {hasChanges &&
            <Button className='w-full' onClick={handleUpdate}>Update</Button>
            }
        </div>
    </>
  )
}
