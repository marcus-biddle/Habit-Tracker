import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Search, Filter, X, LayoutGrid, List, FolderPlus, Folder, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { HabitCreateSheet } from '../Modals/Habits/HabitCreateSheet'
import type { HabitGroup } from '../Tables/Habits/columns'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'

interface FiltersAndActionsCardProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'active' | 'inactive' | 'archived'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive' | 'archived') => void
  groupFilter: string
  onGroupFilterChange: (filter: string) => void
  groups: HabitGroup[]
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
  onGroupModalOpen: () => void
  onHabitModalOpen: (open: boolean) => void
  onPresetGroupsOpen: () => void
  onRefresh: () => Promise<void>
}

export function FiltersAndActionsCard({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  groupFilter,
  onGroupFilterChange,
  groups,
  viewMode,
  onViewModeChange,
  onGroupModalOpen,
  onHabitModalOpen,
  onPresetGroupsOpen,
  onRefresh
}: FiltersAndActionsCardProps) {
  const [open, setOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters & Actions</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search Bar - Full Width on Mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-9 w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Filters Row - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start h-9"
              >
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">
                  {statusFilter === 'all' 
                    ? 'All Habits' 
                    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => onStatusFilterChange('all')}>
                All Habits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('inactive')}>
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('archived')}>
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Group Filter */}
          <Select value={groupFilter} onValueChange={onGroupFilterChange}>
            <SelectTrigger className="w-full h-9">
              <Folder className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="ungrouped">Ungrouped</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    {group.color && (
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    <span className="truncate">{group.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions Row - Responsive Layout */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* View Mode Toggle */}
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => onViewModeChange(value as 'table' | 'grid')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="table" className="flex items-center gap-1.5 text-xs">
                <List className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Table</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-1.5 text-xs">
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>Grid</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-9 px-3"
              onClick={onPresetGroupsOpen}
            >
              <Sparkles className="h-4 w-4 sm:mr-1.5 shrink-0" />
              <span className="hidden sm:inline text-xs">Presets</span>
              <span className="sm:hidden text-xs">Presets</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-9 px-3"
              onClick={onGroupModalOpen}
            >
              <FolderPlus className="h-4 w-4 sm:mr-1.5 shrink-0" />
              <span className="hidden sm:inline text-xs">Group</span>
              <span className="sm:hidden text-xs">Add Group</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 sm:flex-initial h-9 px-3"
              onClick={() => {
                setOpen(true)
                onHabitModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 sm:mr-1.5 shrink-0" />
              <span className="hidden sm:inline text-xs">Habit</span>
              <span className="sm:hidden text-xs">Add Habit</span>
            </Button>
            <HabitCreateSheet 
              open={open} 
              isOpen={(value) => {
                setOpen(value)
                onHabitModalOpen(value)
              }} 
              setHabits={onRefresh} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

