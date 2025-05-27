"use client";

import { Tab, Tabs } from "@heroui/tabs";
import {
  ChartLine,
  ChatCenteredText,
  CurrencyDollar,
  User,
  Users,
} from "@phosphor-icons/react";
import React from "react";

import Stat from "@/components/common/Stat";
import { mockDashboardData } from "@/mocks/dashboardData";

import PerformanceMetrics from "./components/PerformanceMetrics";
import RevenueAnalytics from "./components/RevenueAnalytics";
import UserEngagement from "./components/UserEngagement";

export default function OverviewPage() {
  const {
    userMetrics,
    conversationMetrics,
    revenueMetrics,
    performanceMetrics,
  } = mockDashboardData;

  return (
    <div className="scroll h-[calc(100vh-80px)] space-y-4">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="mt-2 text-gray-500">
          Comprehensive analytics for your chatbox system
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Stat
          title="Total Users"
          value={userMetrics.totalUsers.toLocaleString()}
          change={userMetrics.growth}
          icon={<Users weight="duotone" size={24} />}
        />
        <Stat
          title="Conversations"
          value={conversationMetrics.totalConversations.toLocaleString()}
          change={8.2}
          icon={<ChatCenteredText weight="duotone" size={24} />}
        />
        <Stat
          title="Monthly Revenue"
          value={`$${revenueMetrics.mrr.toLocaleString()}`}
          change={revenueMetrics.growth}
          icon={<CurrencyDollar weight="duotone" size={24} />}
        />
        <Stat
          title="Satisfaction"
          value={`${conversationMetrics.satisfactionScore}/5`}
          change={0.3}
          icon={<User weight="duotone" size={24} />}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <Tabs aria-label="Dashboard tabs" className="mt-2">
          <Tab
            key="engagement"
            title={
              <div className="flex items-center gap-2 px-1">
                <Users size={18} weight="duotone" />
                <span>User Engagement</span>
              </div>
            }
          >
            <UserEngagement
              userMetrics={userMetrics}
              conversationMetrics={conversationMetrics}
            />
          </Tab>

          <Tab
            key="revenue"
            title={
              <div className="flex items-center gap-2 px-1">
                <CurrencyDollar size={18} weight="duotone" />
                <span>Revenue Analytics</span>
              </div>
            }
          >
            <RevenueAnalytics revenueMetrics={revenueMetrics} />
          </Tab>

          <Tab
            key="performance"
            title={
              <div className="flex items-center gap-2 px-1">
                <ChartLine size={18} weight="duotone" />
                <span>System Performance</span>
              </div>
            }
          >
            <PerformanceMetrics performanceMetrics={performanceMetrics} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
