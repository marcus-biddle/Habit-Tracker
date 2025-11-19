import { ArrowUpRightIcon, Projector } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Link } from "react-router"

export function EmptyHabitState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Projector />
        </EmptyMedia>
        <EmptyTitle>No Habits Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any habits yet. Get started by creating
          your first one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
            <Link to={'/dashboard/habits'}>
                <Button>Create Habit</Button>
            </Link>
          <Button variant="outline" disabled>Import Habit</Button>
        </div>
      </EmptyContent>
      {/* <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button> */}
    </Empty>
  )
}