import React, { useState } from "react";
import Chart from "react-apexcharts";

const ChartPrediction = ({predictionDays, data}) => {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "basic-bar",
        foreColor: "#ffffff",
        background: "#2c2c6c"
      },
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        labels: {
          style: {
            colors: "#ffffff"
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: "#ffffff"
          }
        }
      }
    },
    series: [
      {
        name: "series-1",
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }
    ]
  });

  return (
    <div className="chart">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        // width="700"
      />
    </div>
  );
};

export default ChartPrediction;
