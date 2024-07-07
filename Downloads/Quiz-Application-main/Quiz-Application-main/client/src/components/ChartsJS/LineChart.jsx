import React from "react";
import { Line } from "react-chartjs-2";

export const LineChartJS = ({ chartData, title, min, max }) => {
  const defaultMin = typeof min !== 'undefined' ? min : 0;
  const defaultMax = typeof max !== 'undefined' ? max : 100;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
              }
            },
            y: {
              grid: {
                display: false,
              },
              min: defaultMin, 
              max: defaultMax, 
            }
          },
          plugins: {
            title: {
              display: true, 
              text: title 
            },
            legend: {
              display: true
            }
          }
        }}
      />
    </div>
  );
};
