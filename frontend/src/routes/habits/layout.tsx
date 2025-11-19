import { Separator } from '@/components/ui/separator'
import { Outlet } from 'react-router'

const layout = () => {
  return (
    <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
        <div className="md:min-h-min">
            <div className="space-y-1">
                <h4 className="text-sm leading-none font-medium">Habits</h4>
                <p className="text-muted-foreground text-sm">
                    View activities and charts.
                </p>
            </div>
            <Separator className="my-4" />
        </div>
        <Outlet />
    </div>
  )
}

export default layout