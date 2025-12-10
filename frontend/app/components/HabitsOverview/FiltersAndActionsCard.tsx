import { useState } from 'react'
import { Card, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Search, Filter, X, LayoutGrid, List, FolderPlus, Folder } from 'lucide-react'
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
  onRefresh
}: FiltersAndActionsCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
            <Select value={groupFilter} onValueChange={onGroupFilterChange}>
              <SelectTrigger className="w-[180px]">
                <Folder className="h-4 w-4 mr-2" />
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
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      <span>{group.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => onViewModeChange('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => onViewModeChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onGroupModalOpen}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Group
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
      </CardHeader>
    </Card>
  )
}

