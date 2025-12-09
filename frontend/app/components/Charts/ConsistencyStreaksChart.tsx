// ConsistencyStreaksChart.tsx
import React from "react";

interface Props {
  workoutDates: string[]; // array of ISO date strings user has worked out on
}

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const ConsistencyStreaksChart: React.FC<Props> = ({ workoutDates }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = getDaysInMonth(year, month);

  // Create set of workout date strings for quick lookup (YYYY-MM-DD)
  const workoutSet = new Set(workoutDates.map((d) => d.slice(0, 10)));

  // Generate array of days with workout boolean flag
  const days = [...Array(daysInMonth).keys()].map((d) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d + 1
    ).padStart(2, "0")}`;
    return { day: d + 1, workedOut: workoutSet.has(dayStr) };
  });

  return (
    <>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: 280 }}>
            {days.map(({ day, workedOut }) => (
                <div
                key={day}
                title={`Day ${day}: ${workedOut ? "Workout ✅" : "Rest"}`}
                style={{
                width: 30,
                height: 30,
                backgroundColor: workedOut ? "#4caf50" : "#ddd",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: workedOut ? "white" : "#555",
                fontWeight: "bold",
                }}
                >
                {day}
                </div>
            ))}
        </div>
    </>
    
  );
};