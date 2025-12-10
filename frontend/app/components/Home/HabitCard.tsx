import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { CheckCircle2, Forward, Plus, Minus, Edit2, Flame, Loader2 } from 'lucide-react'
import type { Habit, HabitGroup } from '../Tables/Habits/columns'
import type { DashboardHabit } from '../../features/overview/table'
import { 
  getDisplayUnit, 
  getEffectiveGoal, 
  getGoalPeriodText, 
  formatValue,
  isGoalMet 
} from './utils/habitCalculations'

interface HabitCardProps {
  habit: Habit
  currentValue: number
  progress: number
  streak: number
  groups: HabitGroup[]
  onQuickUpdate: (habitId: string, increment: number) => Promise<void>
  onManualUpdate: (habitId: string, value: number) => Promise<void>
}

export function HabitCard({
  habit,
  currentValue,
  progress,
  streak,
  groups,
  onQuickUpdate,
  onManualUpdate
}: HabitCardProps) {
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const isCompleted = progress >= 100

  const group = habit.group_id ? groups.find(g => g.id === habit.group_id) : null
  
  // Get display values
  const displayUnit = getDisplayUnit(habit)
  const effectiveGoal = getEffectiveGoal(habit)
  const goalPeriod = getGoalPeriodText(habit.goal_period)
  const trackingType = habit.tracking_type || 'count'
  const isBinary = trackingType === 'binary'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`w-full h-full flex flex-col hover:shadow-lg transition-all duration-200 ${
        isCompleted ? 'border-primary/20 bg-primary/5' : ''
      }`}>
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              {group && group.color && (
                <div 
                  className="h-3.5 w-3.5 rounded-full shrink-0 mt-1.5 ring-2 ring-background" 
                  style={{ backgroundColor: group.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold capitalize truncate leading-tight">
                    {habit.name}
                  </CardTitle>
                  {habit.goal_period && habit.goal_period !== 'per_day' && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {habit.goal_period === 'per_week' ? 'Weekly' : 'Monthly'}
                    </span>
                  )}
                </div>
                {habit.description && (
                  <CardDescription className="text-xs mt-1 line-clamp-2 leading-relaxed">
                    {habit.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <Link to={`/dashboard/habits/${habit.id}`} onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0 hover:bg-accent"
              >
                <Forward className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 pt-0">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                {isBinary ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {formatValue(habit, currentValue)}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </div>
                ) : (
                  <>
                    <span className={`text-3xl font-bold ${
                      isCompleted ? 'text-primary' : ''
                    }`}>
                      {currentValue}
                    </span>
                    <span className="text-lg text-muted-foreground font-medium">
                      / {effectiveGoal}
                    </span>
                    {displayUnit && (
                      <span className="text-sm text-muted-foreground ml-1">
                        {displayUnit}
                      </span>
                    )}
                    {habit.goal_period && habit.goal_period !== 'per_day' && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({goalPeriod})
                      </span>
                    )}
                  </>
                )}
              </div>
              {!isBinary && isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full transition-colors ${
                    progress >= 100 ? 'bg-primary' :
                    progress >= 75 ? 'bg-green-500' :
                    progress >= 50 ? 'bg-accent' :
                    progress >= 25 ? 'bg-yellow-500' :
                    'bg-muted-foreground'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 font-medium">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{streak} day{streak !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Update Controls */}
          <div className="pt-4 mt-auto border-t">
            <div className="flex items-center gap-2.5">
              {!isBinary && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (isUpdating) return
                          setIsUpdating(true)
                          try {
                            await onQuickUpdate(habit.id, -1)
                          } catch (error) {
                            console.error('Failed to update habit:', error)
                          } finally {
                            setIsUpdating(false)
                          }
                        }}
                        disabled={currentValue <= 0 || isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Decrease by 1</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 px-2 py-1.5 rounded-md bg-secondary/30">
                {isBinary ? (
                  <span className={`text-base font-semibold ${
                    isCompleted ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {formatValue(habit, currentValue)}
                  </span>
                ) : (
                  <>
                    <span className="text-lg font-semibold tabular-nums">{currentValue}</span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">{effectiveGoal}</span>
                    {displayUnit && (
                      <span className="text-xs text-muted-foreground ml-1 truncate">{displayUnit}</span>
                    )}
                  </>
                )}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (isUpdating) return
                        setIsUpdating(true)
                        try {
                          // For binary habits, toggle between 0 and 1
                          if (isBinary) {
                            await onQuickUpdate(habit.id, currentValue >= 1 ? -1 : 1)
                          } else {
                            await onQuickUpdate(habit.id, 1)
                          }
                        } catch (error) {
                          console.error('Failed to update habit:', error)
                        } finally {
                          setIsUpdating(false)
                        }
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isBinary ? (currentValue >= 1 ? 'Mark as not completed' : 'Mark as completed') : 'Increase by 1'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover open={editingHabit === habit.id} onOpenChange={(open) => {
                if (!open) {
                  setEditingHabit(null)
                  setEditValue(0)
                } else {
                  setEditingHabit(habit.id)
                  setEditValue(currentValue)
                }
              }}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 hover:bg-accent transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-${habit.id}`} className="text-sm font-semibold">
                        Update {habit.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Enter the total value for today
                      </p>
                    </div>
                    <div className="space-y-3">
                      {isBinary ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant={editValue >= 1 ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => {
                              setEditValue(editValue >= 1 ? 0 : 1)
                            }}
                          >
                            {editValue >= 1 ? 'Completed' : 'Not Completed'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            id={`edit-${habit.id}`}
                            type="number"
                            min={habit.min_value ?? 0}
                            max={habit.max_value ?? undefined}
                            step={trackingType === 'duration' ? 1 : trackingType === 'weight' || trackingType === 'distance' ? 0.1 : 1}
                            value={editValue || ''}
                            onChange={(e) => setEditValue(Number(e.target.value) || 0)}
                            placeholder="Enter value"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onManualUpdate(habit.id, editValue)
                                setEditingHabit(null)
                                setEditValue(0)
                              }
                            }}
                          />
                          {displayUnit && (
                            <span className="text-sm text-muted-foreground font-medium min-w-12">
                              {displayUnit}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            onManualUpdate(habit.id, editValue)
                            setEditingHabit(null)
                            setEditValue(0)
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setEditingHabit(null)
                            setEditValue(0)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

