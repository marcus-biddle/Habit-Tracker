import { useState } from 'react'
import { 
  Target, 
  Settings, 
  List, 
  Filter,
  Folder,
  Sparkles,
  Plus,
  CheckCircle2,
  ArrowRight,
  Zap,
  Edit,
  BarChart3
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { PresetGroupsSheet } from '../Modals/Habits/PresetGroupsSheet'
import { HabitCreateSheet } from '../Modals/Habits/HabitCreateSheet'
import { Badge } from '../ui/badge'
import { presetGroups } from '../../data/presetGroups'
import type { Habit } from '../Tables/Habits/columns'

interface HabitsOnboardingFlowProps {
  habits?: Habit[]
  onSuccess?: () => void
}

export function HabitsOnboardingFlow({ 
  habits = [], 
  onSuccess 
}: HabitsOnboardingFlowProps) {
  const [presetGroupsOpen, setPresetGroupsOpen] = useState(false)
  const [habitCreateOpen, setHabitCreateOpen] = useState(false)

  const handlePresetSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.reload()
    }
    setPresetGroupsOpen(false)
  }

  const managementFeatures = [
    {
      icon: Settings,
      title: 'Full Control',
      description: 'Edit, organize, and configure all your habits from one central location'
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter by status, group, or search to find exactly what you need'
    },
    {
      icon: List,
      title: 'Multiple Views',
      description: 'Switch between table and grid views to manage habits your way'
    },
    {
      icon: Folder,
      title: 'Organize Groups',
      description: 'Create habit groups to organize related habits together'
    }
  ]

  const workflowSteps = [
    {
      step: 1,
      title: 'Create or Import Habits',
      description: 'Start by creating your own custom habits or importing from preset groups',
      icon: Plus,
      color: 'bg-primary'
    },
    {
      step: 2,
      title: 'Organize with Groups',
      description: 'Group related habits together (e.g., Fitness, Morning Routine) for better organization',
      icon: Folder,
      color: 'bg-blue-500'
    },
    {
      step: 3,
      title: 'Configure & Track',
      description: 'Set goals, frequencies, and tracking types. Then log your daily progress',
      icon: Edit,
      color: 'bg-green-500'
    },
    {
      step: 4,
      title: 'Manage & Analyze',
      description: 'Use this page to edit habits, view stats, archive old ones, and monitor progress',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Target className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Habit Management! 🎯
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          This is your central command center for managing all your habits. 
          Create, organize, edit, and track your habits with powerful tools designed for success.
        </p>
      </div>

      {/* Management Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {managementFeatures.map((feature, index) => (
          <Card key={index} className="border-2">
            <CardHeader className="pb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Section */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Get Started
          </CardTitle>
          <CardDescription className="text-base">
            Choose how you'd like to add your first habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option 1: Create Custom Habit */}
          <div className="flex flex-col md:flex-row gap-4 p-6 rounded-lg border-2 bg-background hover:border-primary/50 transition-colors">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Create Your First Habit</h3>
              </div>
              <p className="text-muted-foreground">
                Design a custom habit from scratch with full control over tracking type, goals, 
                frequency, and all settings. Perfect for personal, unique habits.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Choose tracking type (binary, count, duration, volume)</li>
                <li>Set daily, weekly, or monthly goals</li>
                <li>Add descriptions and reminders</li>
                <li>Configure advanced settings</li>
              </ul>
            </div>
            <div className="flex items-center md:items-end">
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={() => setHabitCreateOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Habit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Option 2: Choose Preset Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Import from Preset Groups</h3>
            </div>
            <p className="text-muted-foreground ml-12">
              Get started quickly with professionally curated habit groups. Each preset includes 
              multiple pre-configured habits ready to track immediately.
            </p>

            {/* Preset Groups Preview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {presetGroups.slice(0, 6).map((preset) => (
                <Card
                  key={preset.id}
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                  onClick={() => setPresetGroupsOpen(true)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{preset.name}</CardTitle>
                          {preset.color && (
                            <div
                              className="w-4 h-4 rounded-full border border-border shrink-0"
                              style={{ backgroundColor: preset.color }}
                            />
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {preset.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {preset.habits.length} habits
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPresetGroupsOpen(true)}
                className="w-full md:w-auto"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                View All Preset Groups
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📋 Your Habit Management Workflow</CardTitle>
          <CardDescription>
            Follow these steps to get the most out of habit management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.color} text-white font-bold shrink-0`}>
                  {step.step}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">💡 Pro Tips for Managing Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Use Groups:</span> Organize related habits (like "Morning Routine" or "Fitness") into groups for easier management
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Filter & Search:</span> Use the powerful filtering tools to quickly find habits by status, group, or name
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Batch Actions:</span> Select multiple habits to activate, deactivate, archive, or delete them all at once
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Archive Old Habits:</span> Don't delete habits you're no longer tracking - archive them to keep historical data
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Regular Reviews:</span> Periodically review and adjust your habits' goals and settings as your needs change
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <PresetGroupsSheet
        open={presetGroupsOpen}
        onOpenChange={setPresetGroupsOpen}
        habits={habits}
        onSuccess={handlePresetSuccess}
      />

      <HabitCreateSheet
        isOpen={(open) => {
          setHabitCreateOpen(open)
          if (!open) {
            // When sheet closes, refresh data
            if (onSuccess) {
              setTimeout(async () => {
                await onSuccess()
              }, 500)
            }
          }
        }}
        open={habitCreateOpen}
        setHabits={async () => {
          // This is called when habit is created successfully
          setHabitCreateOpen(false)
          if (onSuccess) {
            setTimeout(async () => {
              await onSuccess()
            }, 500)
          }
        }}
      />
    </div>
  )
}

