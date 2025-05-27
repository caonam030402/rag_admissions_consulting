import { Card, CardBody, CardHeader } from "@heroui/card";
import { DotsThreeOutline } from "@phosphor-icons/react";
import React from "react";

import AreaChart from "@/components/common/Charts/AreaChart";
import DonutChart from "@/components/common/Charts/DonutChart";
import type { RevenueMetrics } from "@/types/dashboard";

interface RevenueAnalyticsProps {
  revenueMetrics: RevenueMetrics;
}

export default function RevenueAnalytics({
  revenueMetrics,
}: RevenueAnalyticsProps) {
  // Format a number as currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between px-4 pb-0 pt-4">
          <div>
            <h3 className="text-lg font-medium">Monthly Revenue</h3>
            <p className="text-sm text-gray-500">Revenue trends over time</p>
          </div>
          <DotsThreeOutline size={20} />
        </CardHeader>
        <CardBody>
          <AreaChart
            data={revenueMetrics.revenueHistory}
            xKey="month"
            yKey="value"
            height={300}
            yAxisLabel="Revenue ($)"
            colors={["#3b82f6"]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between px-4 pb-0 pt-4">
          <div>
            <h3 className="text-lg font-medium">Revenue by Plan</h3>
            <p className="text-sm text-gray-500">Revenue distribution</p>
          </div>
          <DotsThreeOutline size={20} />
        </CardHeader>
        <CardBody>
          <DonutChart
            data={revenueMetrics.revenueByPlan}
            nameKey="name"
            valueKey="value"
            height={250}
            colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
          />
        </CardBody>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="px-4 pb-0 pt-4">
          <h3 className="text-lg font-medium">Revenue Metrics</h3>
          <p className="text-sm text-gray-500">Key financial indicators</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold">
                {formatCurrency(revenueMetrics.totalRevenue)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm text-gray-500">
                Monthly Recurring Revenue
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(revenueMetrics.mrr)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm text-gray-500">
                Avg. Revenue Per User
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(revenueMetrics.arpu)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm text-gray-500">MoM Growth</p>
              <p className="text-xl font-bold text-green-600">
                +{revenueMetrics.growth}%
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
