import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts for client-side only rendering
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  height = 350,
  xAxisLabel,
  yAxisLabel,
  colors = ["#6366f1"],
}) => {
  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: data.map((item) => item[xKey]),
      title: {
        text: xAxisLabel,
      },
    },
    yaxis: {
      title: {
        text: yAxisLabel,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value: number) => value.toString(),
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
    colors,
  };

  const series = [
    {
      name: yAxisLabel || yKey,
      data: data.map((item) => item[yKey]),
    },
  ];

  return (
    <div className="bar-chart">
      <ApexChart
        options={chartOptions}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default BarChart;
