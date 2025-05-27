import { Card, CardBody, CardHeader } from "@heroui/card";
import { ArrowsOut, DotsThreeOutline } from "@phosphor-icons/react";
import React from "react";

import BarChart from "@/components/common/Charts/BarChart";
import DonutChart from "@/components/common/Charts/DonutChart";
import LineChart from "@/components/common/Charts/LineChart";
import type { ConversationMetrics, UserMetrics } from "@/types/dashboard";

interface UserEngagementProps {
  userMetrics: UserMetrics;
  conversationMetrics: ConversationMetrics;
}

export default function UserEngagement({
  userMetrics,
  conversationMetrics,
}: UserEngagementProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
        <CardHeader className="flex items-center justify-between bg-white px-6 pb-0 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              User Retention
            </h3>
            <p className="text-sm text-gray-500">Monthly retention rates</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              aria-label="Expand chart"
            >
              <ArrowsOut size={16} />
            </button>
            <button
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              aria-label="More options"
            >
              <DotsThreeOutline size={16} />
            </button>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <LineChart
            data={userMetrics.retention}
            xKey="month"
            yKey="rate"
            height={300}
            yAxisLabel="Retention %"
            colors={["#4f46e5"]}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="flex items-center justify-between bg-white px-6 pb-0 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Users by Plan
            </h3>
            <p className="text-sm text-gray-500">Distribution across plans</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              aria-label="More options"
            >
              <DotsThreeOutline size={16} />
            </button>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <DonutChart
            data={userMetrics.usersByPlan}
            nameKey="name"
            valueKey="value"
            height={250}
            colors={["#4f46e5", "#8b5cf6", "#c026d3"]}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-md lg:col-span-3">
        <CardHeader className="flex items-center justify-between bg-white px-6 pb-0 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Weekly Conversation Volume
            </h3>
            <p className="text-sm text-gray-500">
              Number of conversations by day
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              aria-label="Expand chart"
            >
              <ArrowsOut size={16} />
            </button>
            <button
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              aria-label="More options"
            >
              <DotsThreeOutline size={16} />
            </button>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <BarChart
            data={conversationMetrics.conversations}
            xKey="day"
            yKey="count"
            height={300}
            yAxisLabel="Conversations"
            colors={["#6366f1"]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
