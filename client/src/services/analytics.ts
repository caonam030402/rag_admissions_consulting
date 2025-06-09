import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useQueryCommon } from "@/hooks/useQuery";
import http from "@/utils/http";

// Types
export interface ConversationAnalytics {
  totalConversations: number;
  avgConversationLength: number;
  avgResponseTime: number;
  conversationsByDay: Array<{ date: string; count: number }>;
  messageDistribution: Array<{ type: string; count: number }>;
}

export interface MostAskedQuestion {
  question: string;
  count: number;
  category?: string;
  avgSatisfaction?: number;
}

export interface UserSatisfactionMetrics {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  satisfactionTrend: Array<{ date: string; avgRating: number }>;
}

export interface ResponseAccuracyMetrics {
  averageAccuracy: number;
  totalResponses: number;
  accuracyTrend: Array<{ date: string; avgAccuracy: number }>;
  accuracyByCategory: Array<{ category: string; avgAccuracy: number }>;
}

export interface AIAnalyticsMetrics {
  avgAccuracy: number;
  avgRelevance: number;
  avgHelpfulness: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  topCategories: Array<{ category: string; count: number; avgAccuracy: number }>;
  accuracyByCategory: Array<{ category: string; avgAccuracy: number; count: number }>;
  sentimentDistribution: Array<{ sentiment: string; count: number; percentage: number }>;
  complexityDistribution: Array<{ complexity: string; count: number; avgAccuracy: number }>;
  responseTimeStats: {
    avg: number;
    p95: number;
    p99: number;
  };
  satisfactionStats: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
  qualityScore: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface AnalyticsEvent {
  eventType: string;
  conversationId?: string;
  userId?: number;
  guestId?: string;
  sessionId?: string;
  messageContent?: string;
  metadata?: {
    messageLength?: number;
    responseTime?: number;
    confidence?: number;
    retrievedDocs?: number;
    userRating?: number;
    errorType?: string;
    topic?: string;
    intent?: string;
    questionCategory?: string;
    satisfactionScore?: number;
    accuracy?: number;
    [key: string]: any;
  };
  userAgent?: string;
  ipAddress?: string;
}

export const analyticsService = {
  // Get conversation analytics
  useConversationAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return useQueryCommon<ConversationAnalytics>({
      url: `analytics/conversation-analytics${params.toString() ? `?${params.toString()}` : ""}`,
      queryKey: ["analytics", "conversation", startDate, endDate],
    });
  },

  // Get most asked questions
  useMostAskedQuestions: (limit: number = 10) => {
    return useQueryCommon<MostAskedQuestion[]>({
      url: `analytics/most-asked-questions?limit=${limit}`,
      queryKey: ["analytics", "most-asked-questions", limit],
    });
  },

  // Get user satisfaction metrics
  useUserSatisfactionMetrics: () => {
    return useQueryCommon<UserSatisfactionMetrics>({
      url: "analytics/user-satisfaction",
      queryKey: ["analytics", "user-satisfaction"],
    });
  },

  // Get response accuracy metrics
  useResponseAccuracyMetrics: () => {
    return useQueryCommon<ResponseAccuracyMetrics>({
      url: "analytics/response-accuracy",
      queryKey: ["analytics", "response-accuracy"],
    });
  },

  // Get AI-powered analytics metrics
  useAIAnalyticsMetrics: () => {
    return useQueryCommon<AIAnalyticsMetrics>({
      url: "analytics/ai-analytics",
      queryKey: ["analytics", "ai-analytics"],
    });
  },

  // Track analytics event
  useTrackEvent: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (eventData: AnalyticsEvent) => {
        const response = await http.post("analytics/track", {
          body: eventData,
        });
        return response.payload;
      },
      onSuccess: () => {
        // Invalidate analytics queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
      },
      onError: () => {
        // Don't show error toast for analytics tracking failures
        // as they shouldn't interrupt user experience
      },
    });
  },

  // Get all analytics events (admin)
  useAnalyticsEvents: (page: number = 1, limit: number = 10) => {
    return useQueryCommon<AnalyticsEvent[]>({
      url: `analytics?page=${page}&limit=${limit}`,
      queryKey: ["analytics", "events", page, limit],
    });
  },

  // Convenience method to track message sent
  trackMessageSent: (data: {
    conversationId: string;
    messageContent: string;
    userId?: number;
    guestId?: string;
    sessionId?: string;
    metadata?: any;
  }) => {
    const trackEvent = analyticsService.useTrackEvent();
    return trackEvent.mutate({
      eventType: "message_sent",
      ...data,
    });
  },

  // Convenience method to track user feedback
  trackUserFeedback: (data: {
    conversationId: string;
    userRating: number;
    userId?: number;
    guestId?: string;
    metadata?: any;
  }) => {
    const trackEvent = analyticsService.useTrackEvent();
    return trackEvent.mutate({
      eventType: "user_feedback",
      conversationId: data.conversationId,
      userId: data.userId,
      guestId: data.guestId,
      metadata: {
        userRating: data.userRating,
        ...data.metadata,
      },
    });
  },

  // Convenience method to track response generated
  trackResponseGenerated: (data: {
    conversationId: string;
    responseTime: number;
    confidence?: number;
    accuracy?: number;
    userId?: number;
    guestId?: string;
    metadata?: any;
  }) => {
    const trackEvent = analyticsService.useTrackEvent();
    return trackEvent.mutate({
      eventType: "response_generated",
      conversationId: data.conversationId,
      userId: data.userId,
      guestId: data.guestId,
      metadata: {
        responseTime: data.responseTime,
        confidence: data.confidence,
        accuracy: data.accuracy,
        ...data.metadata,
      },
    });
  },

  // Convenience method to track conversation started
  trackConversationStarted: (data: {
    conversationId: string;
    userId?: number;
    guestId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
  }) => {
    const trackEvent = analyticsService.useTrackEvent();
    return trackEvent.mutate({
      eventType: "conversation_started",
      ...data,
    });
  },

  // Convenience method to track human handoff
  trackHumanHandoffRequested: (data: {
    conversationId: string;
    initialMessage: string;
    userId?: number;
    guestId?: string;
    metadata?: any;
  }) => {
    const trackEvent = analyticsService.useTrackEvent();
    return trackEvent.mutate({
      eventType: "human_handoff_requested",
      conversationId: data.conversationId,
      messageContent: data.initialMessage,
      userId: data.userId,
      guestId: data.guestId,
      metadata: data.metadata,
    });
  },
};
