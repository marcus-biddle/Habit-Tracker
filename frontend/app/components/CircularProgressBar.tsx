import { cn } from "../lib/utils"

type CircularProgressProps = {
  value: number
  goal: number
  unit: string
  size?: number
  strokeWidth?: number
  showGoal: boolean
  className?: string
}

export function CircularProgress({
  value,
  goal,
  unit,
  size = 175,
  strokeWidth = 6,
  showGoal,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(goal, Math.max(0, value))
  const offset = circumference - (clamped / goal) * circumference

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* track */}
        <circle
          className="text-slate-500/20 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
          }}
        />
        {/* progress */}
        <circle
          className="text-primary stroke-current transition-[stroke-dashoffset] duration-300 ease-out"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            strokeLinecap: "round",
          }}
        />
      </svg>
      <div className="absolute text-sm font-medium flex flex-col justify-center items-center">
        <p className="text-4xl font-bold text-slate-500 mb-1">{value}</p>
        {/* {showGoal ? <p className="text-gray-400 text-sm font-medium">/ {goal} {unit}</p> : <p className="text-gray-400 text-sm font-medium">{unit}</p>} */}
      </div>
    </div>
  )
}
