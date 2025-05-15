import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts for client-side only rendering
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKey,
  height = 350,
  xAxisLabel,
  yAxisLabel,
  colors = ["#8884d8"],
}) => {
  const chartOptions = {
    chart: {
      type: "area" as const,
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, sans-serif",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
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
    tooltip: {
      y: {
        formatter: (value: number) => value.toString(),
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
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
    <div className="area-chart">
      <ApexChart
        options={chartOptions}
        series={series}
        type="area"
        height={height}
      />
    </div>
  );
};

export default AreaChart;
