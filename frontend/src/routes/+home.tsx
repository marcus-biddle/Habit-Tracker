import React from 'react'
import { ChartAreaInteractive } from "../components/ChartAreaInteractive"
import { ChartBarMultiple } from "../components/Charts/BarChartMultiple"
import { ChartPieSimple } from "../components/ChartPieSimple"
import { ChartRadialSimple } from "../components/ChartRadialSimple"
import { Separator } from "@/components/ui/separator"

export default function home() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex-1 rounded-xl md:min-h-min">
            <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Home</h4>
            <p className="text-muted-foreground text-sm">
              
            </p>
          </div>
            <Separator className="my-4" />
          </div>
    </div>
  )
}
