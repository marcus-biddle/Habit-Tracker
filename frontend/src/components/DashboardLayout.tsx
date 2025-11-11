import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChartAreaInteractive } from "./ChartAreaInteractive"
import { ChartBarMultiple } from "./Charts/BarChartMultiple"
import { ChartPieSimple } from "./ChartPieSimple"
import { ChartRadialStacked } from "./RadialChartStacked"

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {/* <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Create Your Own
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" /> */}
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 rounded-xl md:min-h-min">
            <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Anaytics</h4>
            <p className="text-muted-foreground text-sm">
              Watch your progression over time.
            </p>
          </div>
            <Separator className="my-4" />
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div>
                  <ChartRadialStacked />
            </div>
            <div>
                  <ChartPieSimple />
            </div>
            <div>
              <ChartBarMultiple />
            </div>
          </div>
          <div className="bg-black/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          <div>
            <ChartAreaInteractive />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}