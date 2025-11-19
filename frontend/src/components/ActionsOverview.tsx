import React from 'react'
import { Container } from './Container/Container'
import { CheckCircle2, Circle } from 'lucide-react';

const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (completed) => {
    return completed ? 'bg-emerald-500' : 'bg-blue-500';
  };

export const ActionsOverview = () => {
    // const { actionsByDate } = useActiveUser();
    
  return (
    <Container>
        <div className={`grid grid-cols-${actionsByDate && (actionsByDate.length ?? 1)} gap-4 w-full`}>
            {actionsByDate && actionsByDate.map((action, index) => (
              <div
                key={index}
                className="relative w-full bg-slate-900/50 col-span-3 md:col-span-1 rounded-xl p-6 transition-all hover:bg-slate-900/70 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-4 w-full">
                  <div className="flex items-center gap-3 w-full">
                    {false ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500" />
                    )}
                    <span className="text-slate-200 font-medium text-lg">
                      {action.sheet}
                    </span>
                    {false && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                        COMPLETED
                      </span>
                    )}
                    {!false && (
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs font-semibold">
                        INCOMPLETE
                      </span>
                    )}
                  </div>
                  <span className="text-slate-300 font-semibold text-lg">
                    {action.value}/{10}
                  </span>
                </div>


                  <div className="absolute bottom-0 left-0 w-full h-2 px-0 bg-slate-700/0 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(true)} transition-all duration-500 rounded-full`}
                      style={{ width: `${getProgressPercentage(6, 10)}%` }}
                    />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              {/* <span className="text-slate-300 font-semibold">
                {actionsByDate && actionsByDate.filter(g => g.value >= 10).length} of {actionsByDate && actionsByDate.length} completed
              </span> */}
            </div>
          </div>
    </Container>
  )
}
