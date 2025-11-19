// WeeklyWorkoutFrequencyChart.tsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  BarElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Container } from "../Container/Container";

ChartJS.register(CategoryScale, BarElement, LinearScale, Title, Tooltip, Legend);

interface Props {
  workoutDates: string[]; // array of ISO date strings of all workouts logged by user
}

const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0
  // Get dates for current week Sunday through Saturday
  const weekDates = [...Array(7).keys()].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + offset);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD format
  });
  return weekDates;
};

export const WeeklyWorkoutFrequencyChart: React.FC<Props> = ({ workoutDates }) => {
  const weekDates = getWeekDates();
  // count workouts per day in current week
  const counts = weekDates.map(
    (date) => workoutDates.filter((d) => d.startsWith(date)).length
  );

  const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Workouts",
        data: counts,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const },
      title: {
        display: true,
        text: "Weekly Workout Frequency",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <Container>
        <Bar data={data} options={options} />
    </Container>
  
);
};
