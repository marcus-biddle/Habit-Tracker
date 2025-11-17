import { getHabitsByUserId } from '@/api/supabse'
import { HabitModal } from '@/components/Modals/Habits/habitModal'
import { columns, type Habit } from '@/components/Tables/Habits/columns'
import { DataTable } from '@/components/Tables/Habits/data-table'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const overview = () => {
    const { user } = useAuth();
      const [open, isOpen] = useState(false);
      const [habitTableData, setHabitTableData] = useState<Habit[] | []>([]);
    
      const fetchData = async () => {
        if (!user) return;
        const res = await getHabitsByUserId(user.id);
        setHabitTableData(res ?? []);
      }
    
      useEffect(() => {
        fetchData();
      }, [user, habitTableData])

  return (
    <>
    <div className='flex items-center justify-end'>
        <Button onClick={() => isOpen(true)} variant={'outline'} size={'sm'} className='bg-slate-200'>
          <Plus />
          <span>Habit</span>
        </Button>
      </div>
      <div className="bg-slate-600 text-white rounded-xl md:min-h-min">
        <DataTable columns={columns} data={habitTableData} />
      </div>
      {open && (
        <div className='absolute top-0 w-full max-w-xs md:max-w-6xl h-full mx-auto flex items-center justify-center z-100 '>
          <div onClick={() => isOpen(false)} className='absolute top-0 w-full h-full z-50' />
          <HabitModal onOpen={isOpen} setData={setHabitTableData} />
        </div>
      )}
    </>
  )
}

export default overview