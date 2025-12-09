import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Link } from 'react-router'
import { Plus, Target, Forward } from 'lucide-react'

interface QuickActionsCardProps {
  onLogEntryClick: () => void
}

export function QuickActionsCard({ onLogEntryClick }: QuickActionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your habits and view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                onClick={onLogEntryClick}
                className="h-8 px-3 flex items-center gap-1.5 flex-1 sm:flex-initial"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Log Entry</span>
              </Button>
              <Link to="/dashboard/habits" className="flex-1 sm:flex-initial">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">View All</span>
                </Button>
              </Link>
              <Link to="/dashboard/analytics" className="flex-1 sm:flex-initial">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <Forward className="h-3.5 w-3.5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

