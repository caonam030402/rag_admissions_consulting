import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import React from "react";

import BarChart from "@/components/common/Charts/BarChart";
import type { PerformanceMetrics as PerformanceMetricsType } from "@/types/dashboard";

interface PerformanceMetricsProps {
  performanceMetrics: PerformanceMetricsType;
}

export default function PerformanceMetrics({
  performanceMetrics,
}: PerformanceMetricsProps) {
  const commonTopicsData = [...performanceMetrics.commonTopics].slice(0, 5);

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-0 pt-4 px-4">
          <h3 className="text-lg font-medium">System Performance</h3>
          <p className="text-sm text-gray-500">Key system metrics</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Uptime</p>
              <p className="text-xl font-bold text-green-600">
                {performanceMetrics.uptime}%
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Error Rate</p>
              <p className="text-xl font-bold">
                {performanceMetrics.errorRate}%
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Avg Load Time</p>
              <p className="text-xl font-bold">
                {performanceMetrics.avgLoadTime}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-1">API Latency</p>
              <p className="text-xl font-bold">
                {performanceMetrics.apiLatency}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="pb-0 pt-4 px-4">
          <h3 className="text-lg font-medium">Common Topics</h3>
          <p className="text-sm text-gray-500">Most discussed topics</p>
        </CardHeader>
        <CardBody>
          <Table aria-label="Common topics table">
            <TableHeader>
              <TableColumn>Topic</TableColumn>
              <TableColumn>Count</TableColumn>
            </TableHeader>
            <TableBody>
              {commonTopicsData.map((topic) => (
                <TableRow key={topic.name}>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>{topic.count.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-0 pt-4 px-4">
          <h3 className="text-lg font-medium">Topic Popularity</h3>
          <p className="text-sm text-gray-500">Conversation topics by volume</p>
        </CardHeader>
        <CardBody>
          <BarChart
            data={commonTopicsData}
            xKey="name"
            yKey="count"
            height={300}
            yAxisLabel="Conversations"
            colors={["#14b8a6"]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
