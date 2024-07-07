import React from "react";
import { Bubble } from "react-chartjs-2";

export const BubbleChartJS = ({ chartData,title }) => {

    return (
        <div style={{ height: "100%",width: "100%" }}>
          <Bubble
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: false,
                  text: "Title"
                }
              }
            }}
          />
        </div>
      );
  };