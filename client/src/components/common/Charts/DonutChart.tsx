import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts for client-side only rendering
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DonutChartProps {
  data: Array<Record<string, any>>;
  nameKey: string;
  valueKey: string;
  height?: number;
  colors?: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  nameKey,
  valueKey,
  height = 350,
  colors = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#14b8a6"],
}) => {
  const chartOptions = {
    chart: {
      type: "donut" as const,
      fontFamily: "Inter, sans-serif",
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
    labels: data.map((item) => item[nameKey]),
    legend: {
      position: "bottom" as const,
      fontSize: "13px",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
      style: {
        fontSize: "12px",
        fontWeight: "normal",
        fontFamily: "Inter, sans-serif",
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: false,
              label: "Total",
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
              color: "#373d3f",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
              color: "#373d3f",
              offsetY: -2,
              formatter: (val: number) => val.toLocaleString(),
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
    stroke: {
      width: 2,
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    colors,
  };

  const series = data.map((item) => item[valueKey]);

  return (
    <div className="donut-chart">
      <ApexChart
        options={chartOptions}
        series={series}
        type="donut"
        height={height}
      />
    </div>
  );
};

export default DonutChart;
