import React from 'react'

type ContainerProps = {
    children: React.ReactNode;
}

export const Container = ({children}: ContainerProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50">
        {children}
    </div>
  )
}
