import { Injectable } from '@nestjs/common';
import { chatbotRepository } from './infrastructure/persistence/chatbot.repository';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { CreateChatbotHistoryDto } from './dto/create-chatbot-history.dto';
import { GetChatbotHistoryDto } from './dto/get-chatbot-history.dto';
import { AnalyticsService } from '../analytics/analytics.service';

import { AnalyticsEventType } from '../analytics/infrastructure/persistence/relational/entities/analytics.entity';
import { IQueryOptions } from 'src/utils/types/query-options';

@Injectable()
export class chatbotsService {
  constructor(
    private readonly chatbotRepository: chatbotRepository,
    private readonly analyticsService: AnalyticsService,
  ) { }

  findAllHistoryWithPagination({
    paginationOptions,
    queryOptions,
  }: {
    paginationOptions: IPaginationOptions;
    queryOptions: IQueryOptions;
  }) {
    return this.chatbotRepository.findAllHistoryWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      queryOptions,
    });
  }

  async removeHistory(id: string): Promise<void> {
    // Remove history logic here
    console.log('Removing history:', id);
  }

  async createHistory(dto: CreateChatbotHistoryDto) {
    // Check if this is a new conversation (first message)
    const conversationId = dto.conversationId;
    let isNewConversation = false;

    if (conversationId) {
      const existingMessages =
        await this.chatbotRepository.findHistoryByConversation(
          conversationId,
          1,
          1,
        );
      isNewConversation = existingMessages.length === 0;
    }

    // Create the history record
    const history = await this.chatbotRepository.createHistory({
      userId: dto.userId,
      guestId: dto.guestId,
      role: dto.role,
      content: dto.content,
      conversationId: dto.conversationId,
      title: dto.title,
    });

    // Track analytics events
    try {
      // Track conversation start if this is the first message
      if (isNewConversation && dto.role === 'user') {
        await this.analyticsService.trackEvent({
          eventType: AnalyticsEventType.CONVERSATION_STARTED,
          conversationId: dto.conversationId || history.conversationId,
          userId: dto.userId,
          guestId: dto.guestId,
          metadata: {
            title: dto.title || 'Untitled Conversation',
            firstMessage: dto.content,
          },
        });

        console.log('✅ Conversation started event tracked:', {
          conversationId: dto.conversationId || history.conversationId,
          userId: dto.userId,
          guestId: dto.guestId,
        });
      }

      // Track message event
      await this.analyticsService.trackEvent({
        eventType:
          dto.role === 'user'
            ? AnalyticsEventType.MESSAGE_SENT
            : AnalyticsEventType.MESSAGE_RECEIVED,
        conversationId: dto.conversationId || history.conversationId,
        userId: dto.userId,
        guestId: dto.guestId,
        messageContent: dto.content,
        metadata: {
          messageLength: dto.content.length,
          hasTitle: !!dto.title,
          role: dto.role,
          isNewConversation,
          // Add realistic response time for bot messages based on content complexity
          responseTime:
            dto.role === 'assistant'
              ? this.calculateRealisticResponseTime(dto.content)
              : undefined,
        },
      });

      console.log('✅ Analytics event tracked:', {
        eventType: dto.role === 'user' ? 'MESSAGE_SENT' : 'MESSAGE_RECEIVED',
        conversationId: dto.conversationId || history.conversationId,
        userId: dto.userId,
        guestId: dto.guestId,
        isNewConversation,
      });

      // Enhanced analytics tracking with rule-based evaluation
      if (dto.role === 'assistant') {
        this.trackEnhancedAnalytics(dto, history.conversationId);
      }
    } catch (error) {
      console.error('❌ Failed to track analytics event:', error);
      // Don't fail the main operation if analytics fails
    }

    return history;
  }

  /**
   * Track enhanced analytics with rule-based evaluation (async, non-blocking)
   */
  private async trackEnhancedAnalytics(
    dto: CreateChatbotHistoryDto,
    conversationId: string,
  ): Promise<void> {
    try {
      // Get the last user message to form a Q&A pair
      const recentMessages =
        await this.chatbotRepository.findHistoryByConversation(
          conversationId,
          1,
          2,
        );

      if (recentMessages.length >= 2) {
        const userMessage = recentMessages.find((msg) => msg.role === 'user');
        const assistantMessage = recentMessages.find(
          (msg) => msg.role === 'assistant',
        );

        if (userMessage && assistantMessage) {
          // Rule-based analysis
          const questionCategory = this.categorizeQuestionByKeywords(
            userMessage.content,
          );
          const complexity = this.assessComplexity(userMessage.content);
          const sentiment = this.detectSentiment(userMessage.content);
          const accuracy = this.calculateResponseAccuracy(
            userMessage.content,
            assistantMessage.content,
          );

          // Track enhanced analytics
          await this.analyticsService.trackEvent({
            eventType: AnalyticsEventType.AI_EVALUATION,
            conversationId,
            userId: dto.userId,
            guestId: dto.guestId,
            messageContent: `Q: ${userMessage.content} | A: ${assistantMessage.content}`,
            metadata: {
              questionCategory,
              complexity,
              sentiment,
              accuracy,
              responseLength: assistantMessage.content.length,
              questionLength: userMessage.content.length,
            },
          });

          console.log('✅ Enhanced analytics tracked:', {
            conversationId,
            category: questionCategory,
            accuracy,
            sentiment,
            complexity,
          });
        }
      }
    } catch (error) {
      console.error('❌ Enhanced analytics tracking failed:', error);
      // Don't let analytics failures affect the main flow
    }
  }

  private categorizeQuestionByKeywords(content: string): string {
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes('học phí') ||
      lowerContent.includes('chi phí') ||
      lowerContent.includes('tài chính') ||
      lowerContent.includes('phí')
    ) {
      return 'tuition_fees';
    }
    if (
      lowerContent.includes('tuyển sinh') ||
      lowerContent.includes('điểm') ||
      lowerContent.includes('xét tuyển') ||
      lowerContent.includes('đăng ký')
    ) {
      return 'admissions';
    }
    if (
      lowerContent.includes('ngành') ||
      lowerContent.includes('chuyên ngành') ||
      lowerContent.includes('khoa') ||
      lowerContent.includes('chương trình')
    ) {
      return 'programs';
    }
    if (
      lowerContent.includes('ký túc') ||
      lowerContent.includes('cơ sở vật chất') ||
      lowerContent.includes('thư viện') ||
      lowerContent.includes('phòng')
    ) {
      return 'facilities';
    }
    if (
      lowerContent.includes('việc làm') ||
      lowerContent.includes('nghề nghiệp') ||
      lowerContent.includes('job') ||
      lowerContent.includes('career')
    ) {
      return 'career';
    }

    return 'general';
  }

  private assessComplexity(content: string): string {
    const length = content.length;
    const wordCount = content.split(/\s+/).length;
    const questionMarks = (content.match(/\?/g) || []).length;

    if (length > 200 || wordCount > 30 || questionMarks > 1) {
      return 'complex';
    }
    if (length > 50 || wordCount > 10) {
      return 'medium';
    }

    return 'simple';
  }

  private detectSentiment(content: string): string {
    const lowerContent = content.toLowerCase();
    const positiveWords = [
      'tốt',
      'hay',
      'tuyệt vời',
      'cảm ơn',
      'hữu ích',
      'ok',
      'good',
      'thanks',
    ];
    const negativeWords = [
      'không',
      'tệ',
      'khó',
      'phức tạp',
      'không hiểu',
      'bad',
      'difficult',
    ];

    const positiveCount = positiveWords.filter((word) =>
      lowerContent.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerContent.includes(word),
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateResponseAccuracy(
    question: string,
    response: string,
  ): number {
    let accuracy = 0.75; // Base accuracy

    // Clear questions get better responses
    if (question.includes('?')) accuracy += 0.1;

    // Appropriate response length
    if (response.length > 100 && response.length < 1000) accuracy += 0.1;

    // Vietnamese specific content
    if (
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(
        response,
      )
    ) {
      accuracy += 0.05;
    }

    return Math.min(accuracy, 1.0);
  }

  private calculateRealisticResponseTime(content: string): number {
    // Base response time
    let responseTime = 1.5; // 1.5 seconds base

    // Longer responses take more time
    const contentLength = content.length;
    if (contentLength > 500) responseTime += 1.0;
    else if (contentLength > 200) responseTime += 0.5;

    // Add some variation to make it realistic
    responseTime += Math.random() * 0.8; // Add 0-0.8 seconds randomly

    // Complex Vietnamese responses might take longer
    if (
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(
        content,
      )
    ) {
      responseTime += 0.2;
    }

    // Cap between 1.0 and 4.5 seconds
    return Math.min(Math.max(responseTime, 1.0), 4.5);
  }

  findConversationsByUser(params: GetChatbotHistoryDto) {
    return this.chatbotRepository.findConversationsByUser({
      userId: params.userId,
      guestId: params.guestId,
      page: params.page,
      limit: params.limit,
    });
  }

  findHistoryByConversation(
    conversationId: string,
    page?: number,
    limit?: number,
  ) {
    return this.chatbotRepository.findHistoryByConversation(
      conversationId,
      page,
      limit,
    );
  }

  updateConversationTitle(conversationId: string, title: string) {
    return this.chatbotRepository.updateConversationTitle(
      conversationId,
      title,
    );
  }

  deleteConversation(conversationId: string) {
    return this.chatbotRepository.deleteConversation(conversationId);
  }

  async getChatSuggestions(
    conversationId: string,
  ): Promise<{ suggestions: string[] }> {
    // Get recent conversation history to understand context
    const recentMessages =
      await this.chatbotRepository.findHistoryByConversation(
        conversationId,
        1,
        10, // Get last 10 messages for better context
      );

    // Try RAG API first, fallback to our improved logic
    try {
      const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';

      const response = await fetch(`${ragApiUrl}/api/v1/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          recent_messages: recentMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          return { suggestions: data.suggestions };
        }
      }

      // Fallback to our improved dynamic suggestions
      return this.generateDynamicSuggestions(recentMessages);
    } catch (error) {
      console.error('Error calling RAG API:', error.message);
      // Fallback to our improved dynamic suggestions
      return this.generateDynamicSuggestions(recentMessages);
    }
  }

  private generateDynamicSuggestions(recentMessages: any[]): {
    suggestions: string[];
  } {
    if (!recentMessages || recentMessages.length === 0) {
      return this.getWelcomeSuggestions();
    }

    // Get all conversation content for context analysis
    const allContent = recentMessages
      .map((msg) => msg.content?.toLowerCase() || '')
      .join(' ');

    // Get last bot message to understand what was just discussed
    const lastBotMessage =
      recentMessages
        .filter((msg) => msg.role === 'assistant')
        .pop()
        ?.content?.toLowerCase() || '';

    // Get last user message to understand user's interest
    const lastUserMessage =
      recentMessages
        .filter((msg) => msg.role === 'user')
        .pop()
        ?.content?.toLowerCase() || '';

    // Dynamic suggestions based on conversation flow
    return this.analyzeConversationFlow(
      allContent,
      lastBotMessage,
      lastUserMessage,
      recentMessages,
    );
  }

  private analyzeConversationFlow(
    allContent: string,
    lastBotMessage: string,
    lastUserMessage: string,
    recentMessages: any[],
  ): { suggestions: string[] } {
    // 1. Field-specific suggestions based on detected major
    const fieldSuggestions = this.getFieldSpecificSuggestions(allContent);
    if (fieldSuggestions) {
      return fieldSuggestions;
    }

    // 2. Topic progression suggestions based on what was just discussed
    const topicSuggestions = this.getTopicProgressionSuggestions(
      lastBotMessage,
      lastUserMessage,
    );
    if (topicSuggestions) {
      return topicSuggestions;
    }

    // 3. Context-aware suggestions based on conversation depth
    return this.getContextAwareSuggestions(allContent, recentMessages.length);
  }

  private getFieldSpecificSuggestions(allContent: string): {
    suggestions: string[];
  } | null {
    // Công nghệ thông tin
    if (
      allContent.includes('công nghệ thông tin') ||
      allContent.includes('cntt') ||
      allContent.includes('it') ||
      allContent.includes('lập trình') ||
      allContent.includes('phần mềm') ||
      allContent.includes('mobile app') ||
      allContent.includes('website')
    ) {
      return {
        suggestions: [
          'Chương trình đào tạo ngành CNTT có những môn học chính nào?',
          'Cơ hội thực tập và việc làm trong lĩnh vực IT như thế nào?',
          'Học phí và chi phí học ngành Công nghệ thông tin?',
          'Yêu cầu đầu vào và điểm chuẩn ngành CNTT?',
        ],
      };
    }

    // Kinh tế - Quản trị
    if (
      allContent.includes('kinh tế') ||
      allContent.includes('quản trị') ||
      allContent.includes('marketing') ||
      allContent.includes('tài chính') ||
      allContent.includes('kế toán') ||
      allContent.includes('kinh doanh')
    ) {
      return {
        suggestions: [
          'Chương trình đào tạo ngành Kinh tế có những chuyên ngành nào?',
          'Cơ hội thực tập tại các doanh nghiệp và tập đoàn?',
          'Mức lương và triển vọng nghề nghiệp trong lĩnh vực kinh tế?',
          'Điều kiện xét tuyển và học phí ngành Kinh tế?',
        ],
      };
    }

    // Y khoa - Sức khỏe
    if (
      allContent.includes('y khoa') ||
      allContent.includes('dược') ||
      allContent.includes('điều dưỡng') ||
      allContent.includes('bác sĩ') ||
      allContent.includes('y tế') ||
      allContent.includes('sức khỏe')
    ) {
      return {
        suggestions: [
          'Thời gian đào tạo và chương trình học ngành Y khoa?',
          'Cơ hội thực hành tại bệnh viện và cơ sở y tế?',
          'Chi phí học tập và sinh hoạt ngành Y - Dược?',
          'Điều kiện tuyển sinh và yêu cầu sức khỏe?',
        ],
      };
    }

    return null;
  }

  private getTopicProgressionSuggestions(
    lastBotMessage: string,
    lastUserMessage: string,
  ): { suggestions: string[] } | null {
    // If bot just mentioned tuition fees, suggest related topics
    if (
      lastBotMessage.includes('học phí') ||
      lastBotMessage.includes('chi phí')
    ) {
      return {
        suggestions: [
          'Có những hình thức học bổng và hỗ trợ tài chính nào?',
          'Chính sách miễn giảm học phí cho sinh viên?',
          'Chi phí sinh hoạt và ở ký túc xá như thế nào?',
          'Có thể làm thêm để trang trải học phí không?',
        ],
      };
    }

    // If bot just mentioned curriculum/program
    if (
      lastBotMessage.includes('chương trình') ||
      lastBotMessage.includes('môn học') ||
      lastBotMessage.includes('đào tạo')
    ) {
      return {
        suggestions: [
          'Cơ hội thực tập và làm việc trong ngành này?',
          'Tỷ lệ sinh viên có việc làm sau tốt nghiệp?',
          'Mức lương trung bình của ngành này?',
          'Có thể học thêm chuyên ngành hoặc học kép không?',
        ],
      };
    }

    // If bot just mentioned career opportunities
    if (
      lastBotMessage.includes('việc làm') ||
      lastBotMessage.includes('nghề nghiệp') ||
      lastBotMessage.includes('cơ hội')
    ) {
      return {
        suggestions: [
          'Các kỹ năng cần thiết để thành công trong ngành?',
          'Cơ hội phát triển và thăng tiến như thế nào?',
          'Có thể làm việc ở nước ngoài sau khi tốt nghiệp?',
          'Xu hướng phát triển của ngành trong tương lai?',
        ],
      };
    }

    // If user just asked about admission requirements
    if (
      lastUserMessage.includes('điều kiện') ||
      lastUserMessage.includes('xét tuyển') ||
      lastUserMessage.includes('đầu vào')
    ) {
      return {
        suggestions: [
          'Quy trình nộp hồ sơ và thời gian xét tuyển?',
          'Cần chuẩn bị những giấy tờ gì để đăng ký?',
          'Có cần thi hay phỏng vấn đầu vào không?',
          'Phương thức xét tuyển nào dễ đỗ nhất?',
        ],
      };
    }

    return null;
  }

  private getContextAwareSuggestions(
    allContent: string,
    messageCount: number,
  ): { suggestions: string[] } {
    // For longer conversations, suggest more specific topics
    if (messageCount > 6) {
      return {
        suggestions: [
          'Môi trường học tập và hoạt động ngoại khóa ở trường?',
          'Cơ hội trao đổi sinh viên quốc tế?',
          'Hỗ trợ tìm việc và kết nối doanh nghiệp?',
          'Câu lạc bộ và tổ chức sinh viên tại trường?',
        ],
      };
    }

    // For early conversation, suggest fundamental topics
    return {
      suggestions: [
        'Các ngành học phổ biến và triển vọng tại trường?',
        'Điều kiện tuyển sinh và hồ sơ đăng ký?',
        'Học phí và chính sách hỗ trợ tài chính?',
        'Cơ sở vật chất và môi trường học tập?',
      ],
    };
  }

  private getWelcomeSuggestions(): { suggestions: string[] } {
    return {
      suggestions: [
        'Tôi muốn tìm hiểu về các ngành học tại trường',
        'Điều kiện tuyển sinh và quy trình đăng ký như thế nào?',
        'Thông tin về học phí và học bổng',
        'Cơ hội việc làm sau khi tốt nghiệp',
      ],
    };
  }
}
