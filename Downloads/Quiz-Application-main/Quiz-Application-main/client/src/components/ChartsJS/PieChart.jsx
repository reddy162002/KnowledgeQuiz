import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const PieChartJS = ({ chartData, title }) => {
  console.log('Chart Data:', chartData); // Debugging log

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              enabled: true,
            },
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: true,
              text: title,
            },
          },
        }}
      />
    </div>
  );
};
