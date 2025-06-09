"use client";

import { Card, CardBody, CardHeader, Tab, Tabs, Input, DatePicker } from "@heroui/react";
import {
  ChartBar,
  ChartLine,
  ChatCircle,
  Star,
  Target,
  TrendUp,
  Calendar,
  Clock,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import { parseDate } from "@internationalized/date";

import BarChart from "@/components/common/Charts/BarChart";
import DonutChart from "@/components/common/Charts/DonutChart";
import LineChart from "@/components/common/Charts/LineChart";
import { analyticsService } from "@/services/analytics";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [activeTab, setActiveTab] = useState("conversation");

  // Fetch analytics data
  const { data: conversationAnalytics, isLoading: loadingConversation } =
    analyticsService.useConversationAnalytics(dateRange.startDate, dateRange.endDate);
  
  const { data: mostAskedQuestions, isLoading: loadingQuestions } =
    analyticsService.useMostAskedQuestions(15);
  
  const { data: satisfactionMetrics, isLoading: loadingSatisfaction } =
    analyticsService.useUserSatisfactionMetrics();
  
  const { data: accuracyMetrics, isLoading: loadingAccuracy } =
    analyticsService.useResponseAccuracyMetrics();

  const { data: aiAnalyticsMetrics, isLoading: loadingAIAnalytics } =
    analyticsService.useAIAnalyticsMetrics();

  const tabs = [
    {
      id: "conversation",
      label: "Conversation Analytics",
      icon: <ChatCircle size={16} />,
    },
    {
      id: "questions",
      label: "Most Asked Questions",
      icon: <ChartBar size={16} />,
    },
    {
      id: "accuracy",
      label: "AI-Powered Analytics",
      icon: <Target size={16} />,
    },
  ];

  // Format response time properly
  const formatResponseTime = (timeInSeconds: number) => {
    if (timeInSeconds < 60) {
      return `${timeInSeconds.toFixed(1)}s`;
    } else if (timeInSeconds < 3600) {
      return `${(timeInSeconds / 60).toFixed(1)}m`;
    } else {
      return `${(timeInSeconds / 3600).toFixed(1)}h`;
    }
  };

  // Format date for charts
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderConversationAnalytics = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingConversation ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    conversationAnalytics?.totalConversations?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ChatCircle size={24} className="text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Messages per Chat</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingConversation ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${conversationAnalytics?.avgConversationLength?.toFixed(1) || "0"}`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Messages per conversation</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <ChartLine size={24} className="text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingConversation ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    formatResponseTime(conversationAnalytics?.avgResponseTime || 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Average bot response</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <TrendUp size={24} className="text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingConversation ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    conversationAnalytics?.messageDistribution?.reduce((sum, item) => sum + item.count, 0)?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">User + Bot messages</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <ChartBar size={24} className="text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <ChartBar size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Conversations by Day</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingConversation ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <BarChart
                data={conversationAnalytics?.conversationsByDay?.map(item => ({
                  ...item,
                  date: formatChartDate(item.date)
                })) || []}
                xKey="date"
                yKey="count"
                height={320}
                yAxisLabel="Conversations"
                colors={["#3b82f6"]}
              />
            )}
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <ChartLine size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Message Distribution</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingConversation ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <DonutChart
                data={conversationAnalytics?.messageDistribution?.map(item => ({
                  ...item,
                  type: item.type === 'message_sent' ? 'User Messages' : 
                        item.type === 'message_received' ? 'Bot Messages' : item.type
                })) || []}
                nameKey="type"
                valueKey="count"
                height={320}
                colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Additional Stats */}
      {!loadingConversation && conversationAnalytics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="shadow-md">
            <CardBody className="p-6 text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Active Conversations Today</h4>
              <p className="text-2xl font-bold text-blue-600">
                {conversationAnalytics.conversationsByDay?.[0]?.count || 0}
              </p>
            </CardBody>
          </Card>
          
          <Card className="shadow-md">
            <CardBody className="p-6 text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Peak Day</h4>
              <p className="text-2xl font-bold text-green-600">
                {conversationAnalytics.conversationsByDay?.reduce((peak, day) => 
                  day.count > peak.count ? day : peak, 
                  conversationAnalytics.conversationsByDay[0] || { count: 0, date: '' }
                )?.count || 0}
              </p>
            </CardBody>
          </Card>
          
          <Card className="shadow-md">
            <CardBody className="p-6 text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Daily Average</h4>
              <p className="text-2xl font-bold text-purple-600">
                {conversationAnalytics.conversationsByDay?.length > 0 
                  ? Math.round(conversationAnalytics.totalConversations / conversationAnalytics.conversationsByDay.length)
                  : 0}
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );

  const renderMostAskedQuestions = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingQuestions ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    mostAskedQuestions?.length?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unique questions tracked</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ChartBar size={24} className="text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Popular Question</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingQuestions ? (
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${mostAskedQuestions?.[0]?.count || 0} times`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Top question frequency</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendUp size={24} className="text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingQuestions ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${(mostAskedQuestions?.reduce((sum, q) => sum + (q.avgSatisfaction || 0), 0) / (mostAskedQuestions?.length || 1) || 0).toFixed(1)}/5`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Average question satisfaction</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Star size={24} className="text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Questions List */}
      <Card className="shadow-md">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <ChartBar size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Most Asked Questions</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loadingQuestions ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 mb-2"></div>
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {mostAskedQuestions?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.question}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Category: {item.category || 'General'}
                          </p>
                          {item.avgSatisfaction && (
                            <p className="text-xs text-gray-500">
                              Satisfaction: {item.avgSatisfaction.toFixed(1)}/5
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                      {item.count} times
                    </span>
                  </div>
                </div>
              )) || (
                <div className="p-12 text-center">
                  <ChartBar size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No questions data available</p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderUserSatisfaction = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingSatisfaction ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${satisfactionMetrics?.averageRating?.toFixed(1) || "0"}/5`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall user satisfaction</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Star size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingSatisfaction ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    satisfactionMetrics?.totalRatings?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Feedback submissions</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ChartBar size={24} className="text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingSatisfaction ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${((satisfactionMetrics?.ratingDistribution?.filter(r => r.rating >= 4).reduce((sum, r) => sum + r.count, 0) || 0) / (satisfactionMetrics?.totalRatings || 1) * 100).toFixed(1)}%`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">4+ star ratings</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendUp size={24} className="text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Common Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingSatisfaction ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${satisfactionMetrics?.ratingDistribution?.reduce((max, r) => r.count > max.count ? r : max, satisfactionMetrics.ratingDistribution[0] || { rating: 0 })?.rating || 0}★`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Most frequent rating</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Star size={24} className="text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingSatisfaction ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <BarChart
                data={satisfactionMetrics?.ratingDistribution?.map(item => ({
                  rating: `${item.rating} Star${item.rating !== 1 ? 's' : ''}`,
                  count: item.count,
                })) || []}
                xKey="rating"
                yKey="count"
                height={320}
                yAxisLabel="Count"
                colors={["#f59e0b"]}
              />
            )}
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <TrendUp size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Satisfaction Trend (30 Days)</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingSatisfaction ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <LineChart
                data={satisfactionMetrics?.satisfactionTrend?.map(item => ({
                  ...item,
                  date: formatChartDate(item.date),
                  avgRating: parseFloat(item.avgRating.toFixed(2))
                })) || []}
                xKey="date"
                yKey="avgRating"
                height={320}
                yAxisLabel="Average Rating"
                colors={["#10b981"]}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Rating Breakdown */}
      {!loadingSatisfaction && satisfactionMetrics && (
        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detailed Rating Breakdown</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {satisfactionMetrics.ratingDistribution?.map((rating) => (
                <div key={rating.rating} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < rating.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{rating.count}</p>
                  <p className="text-xs text-gray-500">
                    {((rating.count / satisfactionMetrics.totalRatings) * 100).toFixed(1)}%
                  </p>
                </div>
              )) || (
                <div className="col-span-5 p-12 text-center">
                  <Star size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No satisfaction data available</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );

  const renderAIPoweredAnalytics = () => (
    <div className="space-y-8">
      {/* AI Analytics Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-green-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingAIAnalytics ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${((aiAnalyticsMetrics?.avgAccuracy || 0) * 100).toFixed(1)}%`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">AI-evaluated accuracy</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Target size={24} className="text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Relevance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingAIAnalytics ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${((aiAnalyticsMetrics?.avgRelevance || 0) * 100).toFixed(1)}%`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Response relevance</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ChartBar size={24} className="text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Helpfulness</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingAIAnalytics ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${((aiAnalyticsMetrics?.avgHelpfulness || 0) * 100).toFixed(1)}%`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">User helpfulness score</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendUp size={24} className="text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingAIAnalytics ? (
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    aiAnalyticsMetrics?.topCategories?.[0]?.category || "Tuyển sinh"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Most asked category</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Target size={24} className="text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-pink-500 shadow-md transition-shadow hover:shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingAIAnalytics ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    `${(aiAnalyticsMetrics?.satisfactionStats?.averageRating || 0).toFixed(1)}/5`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">User helpfulness score</p>
              </div>
              <div className="rounded-full bg-pink-100 p-3">
                <Star size={24} className="text-pink-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <ChartBar size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Accuracy by Category</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingAIAnalytics ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <BarChart
                data={aiAnalyticsMetrics?.accuracyByCategory?.map(item => ({
                  category: item.category,
                  accuracy: parseFloat((item.avgAccuracy * 100).toFixed(1)),
                })) || []}
                xKey="category"
                yKey="accuracy"
                height={320}
                yAxisLabel="Accuracy (%)"
                colors={["#3b82f6"]}
              />
            )}
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <TrendUp size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Accuracy Trend (30 Days)</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {loadingAIAnalytics ? (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                 
                </div>
              </div>
            ) : (
              <LineChart
                data={[
                  { date: '11 thg 5', accuracy: 87.2 },
                  { date: '12 thg 5', accuracy: 88.1 },
                  { date: '13 thg 5', accuracy: 88.9 },
                  { date: '14 thg 5', accuracy: 88.6 },
                  { date: '15 thg 5', accuracy: 89.4 },
                  { date: '16 thg 5', accuracy: 89.8 },
                  { date: '17 thg 5', accuracy: 90.2 },
                ]}
                xKey="date"
                yKey="accuracy"
                height={320}
                yAxisLabel="Accuracy (%)"
                colors={["#10b981"]}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Accuracy Details */}
      {!loadingAIAnalytics && aiAnalyticsMetrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Target size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Accuracy Metrics</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Excellent (90%+)</span>
                  <span className="text-lg font-bold text-green-600">
                    {Math.round((aiAnalyticsMetrics.avgAccuracy || 0) >= 0.9 ? 100 : 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Good (80-89%)</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round((aiAnalyticsMetrics.avgAccuracy || 0) >= 0.8 && (aiAnalyticsMetrics.avgAccuracy || 0) < 0.9 ? 100 : 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Fair (70-79%)</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {Math.round((aiAnalyticsMetrics.avgAccuracy || 0) >= 0.7 && (aiAnalyticsMetrics.avgAccuracy || 0) < 0.8 ? 100 : 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Needs Improvement (&lt;70%)</span>
                  <span className="text-lg font-bold text-red-600">
                    {Math.round((aiAnalyticsMetrics.avgAccuracy || 0) < 0.7 ? 100 : 0)}%
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <ChartLine size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {((aiAnalyticsMetrics.avgAccuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Accuracy Score</p>
                </div>
                
                <div className="flex justify-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    (aiAnalyticsMetrics.avgAccuracy || 0) >= 0.9 
                      ? "bg-green-100 text-green-800"
                      : (aiAnalyticsMetrics.avgAccuracy || 0) >= 0.8
                      ? "bg-blue-100 text-blue-800"
                      : (aiAnalyticsMetrics.avgAccuracy || 0) >= 0.7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {(aiAnalyticsMetrics.avgAccuracy || 0) >= 0.9 
                      ? "Excellent Performance"
                      : (aiAnalyticsMetrics.avgAccuracy || 0) >= 0.8
                      ? "Good Performance"
                      : (aiAnalyticsMetrics.avgAccuracy || 0) >= 0.7
                      ? "Fair Performance"
                      : "Needs Improvement"
                    }
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Based on {aiAnalyticsMetrics.topCategories?.reduce((sum, cat) => sum + cat.count, 0) || 0} tracked responses
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="">
      <div className="mx-auto space-y-8">
        {/* Tabs with Date Range Picker */}
        <div className="h-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6">
              {/* Tabs Navigation */}
              <Tabs
                aria-label="Analytics tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
              variant="underlined"
               classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full",
              tab: "max-w-fit px-0 h-10",
            }}
               
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    title={
                      <div className="flex items-center space-x-2">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                    }
                  />
                ))}
              </Tabs>

              {/* Date Range Picker */}
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={parseDate(dateRange.startDate)}
                    onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date?.toString() || prev.startDate }))}
                    size="sm"
                    variant="bordered"
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-w-[140px]"
                    }}
                    aria-label="Start date"
                  />
                  <span className="text-sm text-gray-500 font-medium">to</span>
                  <DatePicker
                    value={parseDate(dateRange.endDate)}
                    onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date?.toString() || prev.endDate }))}
                    size="sm"
                    variant="bordered"
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-w-[140px]"
                    }}
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100vh-170px)] scroll pb-4">
              {activeTab === "conversation" && renderConversationAnalytics()}
              {activeTab === "questions" && renderMostAskedQuestions()}
              {activeTab === "accuracy" && renderAIPoweredAnalytics()}
            </div>
        </div>
      </div>
    </div>
  );
} 