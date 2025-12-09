// ExerciseProgressionChart.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExerciseEntry {
  date: string; // ISO date string
  weight: number; // weight lifted
  reps: number;
}

interface Props {
  exerciseName: string;
  entries: ExerciseEntry[];
}

export const ExerciseProgressionChart: React.FC<Props> = ({
  exerciseName,
  entries,
}) => {
  // Sort entries by date ascending
  const sortedEntries = entries.slice().sort((a, b) => a.date.localeCompare(b.date));

  const data = {
    labels: sortedEntries.map((e) => e.date.slice(0, 10)),
    datasets: [
      {
        label: `Weight lifted (${exerciseName})`,
        data: sortedEntries.map((e) => e.weight),
        fill: false,
        borderColor: "rgba(255, 99, 132, 0.7)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
      },
      {
        label: "Reps",
        data: sortedEntries.map((e) => e.reps),
        fill: false,
        borderColor: "rgba(54, 162, 235, 0.7)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        tension: 0.3,
        yAxisID: "reps",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Progression for ${exerciseName}`,
      },
      legend: {
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: { display: true, text: "Weight (lbs)" },
      },
      reps: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Reps" },
      },
      x: {
        title: { display: true, text: "Date" },
      },
    },
  };

  return (

        <Line data={data} options={options} />

);
};
