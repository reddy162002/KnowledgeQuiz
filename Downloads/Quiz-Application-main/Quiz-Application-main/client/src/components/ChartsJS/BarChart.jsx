import { Bar } from "react-chartjs-2";

export const BarChartJS = ({ chartData,title, min, max }) => {
  const defaultMin = typeof min !== 'undefined' ? min : 0;
  const defaultMax = typeof max !== 'undefined' ? max : 100;

  return (
    <div style={{ height: "100%",width: "100%" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              border: {
                display: true
              },
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
              display: false,
              text: {title}
            },
            legend: {
              display: false
            }
          }
        }}
      />  
    </div>
  );
};