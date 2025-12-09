import { Separator } from '../../components/ui/separator'
import { CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Play, Pause, Archive, ArchiveRestore } from 'lucide-react'
import { AlertDialogButton } from '../AlertDialogButton'

interface BatchActionsBarProps {
  selectedCount: number
  onActivate: () => void
  onDeactivate: () => void
  onArchive: () => void
  onUnarchive: () => void
  onDelete: () => void
}

export function BatchActionsBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onArchive,
  onUnarchive,
  onDelete
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <>
      <Separator />
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} habit(s) selected
          </span>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="outline"
            size="sm"
            onClick={onActivate}
          >
            <Play className="h-4 w-4 mr-2" />
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
          >
            <Pause className="h-4 w-4 mr-2" />
            Deactivate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnarchive}
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Unarchive
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <AlertDialogButton
            onContinue={onDelete}
            variant="destructive"
            dialingDesc="This action cannot be undone. All selected habits will be permanently deleted."
            buttonText="Delete"
          />
        </div>
      </CardContent>
    </>
  )
}

