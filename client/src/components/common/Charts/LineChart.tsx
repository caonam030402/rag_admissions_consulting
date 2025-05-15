import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts for client-side only rendering
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  seriesName?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  height = 350,
  xAxisLabel,
  yAxisLabel,
  colors = ["#10b981"],
  seriesName,
}) => {
  const chartOptions = {
    chart: {
      type: "line" as const,
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, sans-serif",
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
      lineCap: "round" as const,
    },
    xaxis: {
      categories: data.map((item) => item[xKey]),
      title: {
        text: xAxisLabel,
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      title: {
        text: yAxisLabel,
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value: number) => value.toString(),
        style: {
          fontSize: "11px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => value.toString(),
      },
      theme: "light",
      style: {
        fontSize: "12px",
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 5,
      padding: {
        right: 10,
      },
    },
    colors,
    markers: {
      size: 4,
      colors,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
  };

  const series = [
    {
      name: seriesName || yAxisLabel || yKey,
      data: data.map((item) => item[yKey]),
    },
  ];

  return (
    <div className="line-chart">
      <ApexChart
        options={chartOptions}
        series={series}
        type="line"
        height={height}
      />
    </div>
  );
};

export default LineChart;
