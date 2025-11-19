// TotalVolumeChart.tsx
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
import { Container } from "../Container/Container";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutEntry {
  date: string; // ISO date string per workout session
  sets: number;
  reps: number;
  weight: number; // weight per rep lifted
}

interface Props {
  workoutEntries: WorkoutEntry[];
}

export const TotalVolumeChart: React.FC<Props> = ({ workoutEntries }) => {
  // Aggregate total volume per date: sum of sets * reps * weight
  const volumeByDate: Record<string, number> = {};

  workoutEntries.forEach(({ date, sets, reps, weight }) => {
    const day = date.slice(0, 10); // YYYY-MM-DD
    const volume = sets * reps * weight;
    volumeByDate[day] = (volumeByDate[day] || 0) + volume;
  });

  // Sort dates ascending for chart labels
  const sortedDates = Object.keys(volumeByDate).sort();

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: "Total Volume (sets × reps × weight)",
        data: sortedDates.map((date) => volumeByDate[date]),
        fill: false,
        borderColor: "rgba(53, 162, 235, 0.7)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Total Workout Volume Over Time",
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Volume (sets × reps × weight)" },
      },
    },
  };

  return (
    <Container>
        <Line data={data} options={options} />
    </Container>
  );
};
