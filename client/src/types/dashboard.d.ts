// User-related metrics
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  growth: number;
  usersByPlan: Array<{ name: string; value: number }>;
  retention: Array<{ month: string; rate: number }>;
}

// Conversation-related metrics
export interface ConversationMetrics {
  totalConversations: number;
  activeConversations: number;
  avgDuration: string;
  avgResponseTime: string;
  satisfactionScore: number;
  conversations: Array<{ day: string; count: number }>;
  handoffs: {
    ai: number;
    human: number;
  };
}

// Revenue-related metrics
export interface RevenueMetrics {
  totalRevenue: number;
  mrr: number;
  arpu: number;
  growth: number;
  revenueByPlan: Array<{ name: string; value: number }>;
  revenueHistory: Array<{ month: string; value: number }>;
}

// System performance metrics
export interface PerformanceMetrics {
  uptime: number;
  errorRate: number;
  avgLoadTime: string;
  apiLatency: string;
  commonTopics: Array<{ name: string; count: number }>;
}

// Complete dashboard data model
export interface DashboardData {
  userMetrics: UserMetrics;
  conversationMetrics: ConversationMetrics;
  revenueMetrics: RevenueMetrics;
  performanceMetrics: PerformanceMetrics;
}
