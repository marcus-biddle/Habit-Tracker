import React from 'react'
import { Separator } from "@/components/ui/separator"
import { ChartRadialSimple } from '@/components/ChartRadialSimple'
import { ChartPieSimple } from '@/components/ChartPieSimple'
import { ChartBarMultiple } from '@/components/Charts/BarChartMultiple'
import { ChartAreaInteractive } from '@/components/ChartAreaInteractive'

export default function analytics() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div>
                  <ChartRadialSimple />
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
  )
}