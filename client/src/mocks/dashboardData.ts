import type { DashboardData } from "@/types/dashboard";

// Mock data for the dashboard
export const mockDashboardData: DashboardData = {
  userMetrics: {
    totalUsers: 12487,
    activeUsers: 8962,
    newUsers: 324,
    growth: 12.4,
    usersByPlan: [
      { name: "Basic", value: 5843 },
      { name: "Premium", value: 4208 },
      { name: "Enterprise", value: 2436 },
    ],
    retention: [
      { month: "Jan", rate: 78 },
      { month: "Feb", rate: 74 },
      { month: "Mar", rate: 79 },
      { month: "Apr", rate: 81 },
      { month: "May", rate: 84 },
      { month: "Jun", rate: 82 },
    ],
  },
  conversationMetrics: {
    totalConversations: 34567,
    activeConversations: 143,
    avgDuration: "5m 23s",
    avgResponseTime: "18.5s",
    satisfactionScore: 4.7,
    conversations: [
      { day: "Mon", count: 532 },
      { day: "Tue", count: 623 },
      { day: "Wed", count: 714 },
      { day: "Thu", count: 842 },
      { day: "Fri", count: 926 },
      { day: "Sat", count: 412 },
      { day: "Sun", count: 327 },
    ],
    handoffs: {
      ai: 82,
      human: 18,
    },
  },
  revenueMetrics: {
    totalRevenue: 284963,
    mrr: 47820,
    arpu: 42.8,
    growth: 8.6,
    revenueByPlan: [
      { name: "Basic", value: 58430 },
      { name: "Premium", value: 126240 },
      { name: "Enterprise", value: 100293 },
    ],
    revenueHistory: [
      { month: "Jan", value: 39400 },
      { month: "Feb", value: 42100 },
      { month: "Mar", value: 43800 },
      { month: "Apr", value: 45200 },
      { month: "May", value: 46400 },
      { month: "Jun", value: 47820 },
    ],
  },
  performanceMetrics: {
    uptime: 99.98,
    errorRate: 0.03,
    avgLoadTime: "0.42s",
    apiLatency: "128ms",
    commonTopics: [
      { name: "Admission Requirements", count: 4328 },
      { name: "Application Process", count: 3912 },
      { name: "Scholarships", count: 3214 },
      { name: "Campus Life", count: 2876 },
      { name: "Course Info", count: 2543 },
    ],
  },
};
