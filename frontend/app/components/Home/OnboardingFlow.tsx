import { useState } from 'react'
import { Link } from 'react-router'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  Plus,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { PresetGroupsSheet } from '../Modals/Habits/PresetGroupsSheet'
import { Badge } from '../ui/badge'
import { presetGroups } from '../../data/presetGroups'
import type { Habit } from '../Tables/Habits/columns'

interface OnboardingFlowProps {
  habits?: Habit[]
  onSuccess?: () => void
}

export function OnboardingFlow({ habits = [], onSuccess }: OnboardingFlowProps) {
  const [presetGroupsOpen, setPresetGroupsOpen] = useState(false)

  const handlePresetSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.reload()
    }
    setPresetGroupsOpen(false)
  }

  const features = [
    {
      icon: Target,
      title: 'Track Your Goals',
      description: 'Set daily, weekly, or monthly goals and track your progress effortlessly'
    },
    {
      icon: TrendingUp,
      title: 'Build Streaks',
      description: 'Maintain consistency and watch your streaks grow day by day'
    },
    {
      icon: Calendar,
      title: 'Daily Logging',
      description: 'Quickly log your habits each day and see your progress at a glance'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Get detailed analytics to understand your habits and improve over time'
    }
  ]

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Habit Tracker! 🎉
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Build better habits, track your progress, and achieve your goals. 
          Let's get you started on your journey to success.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
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
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Getting Started
          </CardTitle>
          <CardDescription className="text-base">
            Choose how you'd like to begin tracking your habits
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
                <h3 className="text-xl font-semibold">Create Your Own Habit</h3>
              </div>
              <p className="text-muted-foreground">
                Start from scratch and create a custom habit tailored to your personal goals. 
                Set your own tracking type, goals, and schedule.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Full customization of habit details</li>
                <li>Choose tracking type (binary, count, duration, volume)</li>
                <li>Set daily, weekly, or monthly goals</li>
              </ul>
            </div>
            <div className="flex items-center md:items-end">
              <Link to="/dashboard/habits">
                <Button size="lg" className="w-full md:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Habit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Option 2: Choose Preset Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Choose a Preset Group</h3>
            </div>
            <p className="text-muted-foreground ml-12">
              Get started quickly with one of our curated habit groups. Each preset includes 
              multiple habits ready to track.
            </p>

            {/* Preset Groups Grid */}
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

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>Start with 2-3 habits to build consistency before adding more</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>Log your habits daily to maintain streaks and see your progress</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>Review your analytics regularly to understand patterns and adjust goals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>Group related habits together to organize and track similar goals</span>
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
    </div>
  )
}

