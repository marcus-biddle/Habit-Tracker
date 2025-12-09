import { Separator } from "../ui/separator"

export function HomeHeader() {
  return (
    <div className="md:min-h-min w-full">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Dashboard</h4>
        <p className="text-muted-foreground text-sm">
          Track your habits and log your daily progress.
        </p>
      </div>
      <Separator className="my-4" />
    </div>
  )
}

