// ExerciseVarietyChart.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Container } from "../Container/Container";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExerciseCategoryCount {
  category: string;
  count: number;
}

interface Props {
  exerciseData: ExerciseCategoryCount[]; // e.g. [{ category: "Chest", count: 12 }, { category: "Legs", count: 8 }]
}

export const ExerciseVarietyChart: React.FC<Props> = ({ exerciseData }) => {
  const data = {
    labels: exerciseData.map(e => e.category),
    datasets: [
      {
        data: exerciseData.map(e => e.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Container>
        <Pie data={data} options={options} />
    </Container>
  );
};
