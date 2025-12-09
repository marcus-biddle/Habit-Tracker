import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Combobox } from '../ComboBox'
import { AlertDialogButton } from '../AlertDialogButton'

interface QuickEntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (habitId: string, value: number) => Promise<void>
}

export function QuickEntryForm({ isOpen, onClose, onSubmit }: QuickEntryFormProps) {
  const [habit, selectHabit] = useState<string>('')
  const [value, selectValue] = useState<number>(0)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!habit) return

    await onSubmit(habit, value)
    selectHabit('')
    selectValue(0)
  }

  if (!isOpen) return null

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Log Habit Entry</CardTitle>
          <CardDescription>
            Select your habit and enter the value you completed today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="habit">Select Habit</Label>
                <div className='relative w-full'>
                  <Combobox onSelect={selectHabit} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">How many units did you complete today?</Label>
                <Input 
                  id="value" 
                  type="number" 
                  min={0} 
                  value={value || ''}
                  onChange={(e) => selectValue(Number(e.target.value) || 0)} 
                  required 
                  placeholder="Enter value"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex gap-2">
          <AlertDialogButton 
            buttonText='Save Entry' 
            type='submit' 
            onContinue={() => formRef.current?.requestSubmit()} 
            dialingDesc='This will add an entry for today.' 
          />
          <Button variant="outline" onClick={() => {
            onClose()
            selectHabit('')
            selectValue(0)
          }}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

