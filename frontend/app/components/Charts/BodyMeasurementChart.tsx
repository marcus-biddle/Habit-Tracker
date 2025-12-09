// BodyMeasurementsChart.tsx
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

interface MeasurementEntry {
  date: string;  // ISO date string
  weight: number; // weight in lbs or kg
  bodyFatPercent?: number; // optional body fat percentage
}

interface Props {
  measurements: MeasurementEntry[];
}

export const BodyMeasurementsChart: React.FC<Props> = ({ measurements }) => {
  // Sort measurements by date ascending
  const sorted = measurements.slice().sort((a, b) => a.date.localeCompare(b.date));

  const data = {
    labels: sorted.map(m => m.date.slice(0, 10)),
    datasets: [
      {
        label: "Weight",
        data: sorted.map(m => m.weight),
        borderColor: "rgba(255, 159, 64, 0.7)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        fill: false,
        tension: 0.3,
      },
      ...(sorted[0].bodyFatPercent !== undefined ? [{
        label: "Body Fat %",
        data: sorted.map(m => m.bodyFatPercent || null),
        borderColor: "rgba(54, 162, 235, 0.7)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        fill: false,
        tension: 0.3,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Body Measurements Over Time" },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: "Value" } },
      x: { title: { display: true, text: "Date" } }
    },
    maintainAspectRatio: false,
  };

  return (

        <Line data={data} options={options} />

  );
};
