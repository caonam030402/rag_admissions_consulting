import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    AnalyticsEntity,
    AnalyticsEventType,
} from '../../../../modules/analytics/infrastructure/persistence/relational/entities/analytics.entity';

@Injectable()
export class AnalyticsSeedService {
    constructor(
        @InjectRepository(AnalyticsEntity)
        private repository: Repository<AnalyticsEntity>,
    ) { }

    async run(): Promise<void> {
        const count = await this.repository.count();

        if (count === 0) {
            await this.seedAnalyticsData();
        }
    }

    private async seedAnalyticsData(): Promise<void> {
        const mockData: Partial<AnalyticsEntity>[] = [];
        const currentDate = new Date();

        // Generate data for the last 60 days
        for (let day = 0; day < 60; day++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - day);

            // Generate 15-35 conversations per day (increased from 5-15)
            const conversationsPerDay = Math.floor(Math.random() * 21) + 15;

            for (let conv = 0; conv < conversationsPerDay; conv++) {
                const conversationId = uuidv4();
                // Create more varied guest IDs with some returning users
                const isReturningUser = Math.random() > 0.7; // 30% chance of returning user
                const guestId = isReturningUser
                    ? `guest-${Math.floor(Math.random() * 200)}` // Returning users from smaller pool
                    : `guest-${Math.floor(Math.random() * 2000) + 1000}`; // New users
                const sessionId = `session-${conversationId}`;

                // Conversation started
                mockData.push({
                    eventType: AnalyticsEventType.CONVERSATION_STARTED,
                    conversationId,
                    guestId,
                    sessionId,
                    createdAt: new Date(
                        date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                    ),
                    userAgent: [
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
                        'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0',
                    ][Math.floor(Math.random() * 5)],
                    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                });

                // Generate 5-15 messages per conversation (increased from 3-10)
                const messagesPerConv = Math.floor(Math.random() * 11) + 5;

                // Generate realistic message flow with varied patterns
                let userMessageCount = 0;
                let botMessageCount = 0;

                for (let msg = 0; msg < messagesPerConv; msg++) {
                    const isUserMessage = Math.random() > 0.45; // 55% chance of user message

                    if (isUserMessage) {
                        // User message - categorized questions for better analytics
                        const questions = [
                            // Admissions category
                            'Thông tin tuyển sinh đại học như thế nào?',
                            'Điểm chuẩn năm nay bao nhiêu?',
                            'Thời gian nộp hồ sơ khi nào?',
                            'Điều kiện xét tuyển ra sao?',
                            'Hồ sơ tuyển sinh cần những gì?',
                            'Phương thức xét tuyển có gì?',
                            'Cho em hỏi thêm về điều kiện xét tuyển',
                            'Cảm ơn bạn',

                            // Tuition fees category
                            'Học phí của trường là bao nhiêu?',
                            'Chi phí học tập như thế nào?',
                            'Có học bổng nào không?',
                            'Hỗ trợ tài chính ra sao?',

                            // Programs category
                            'Có những ngành nào đào tạo?',
                            'Chương trình đào tạo thế nào?',
                            'Ngành nào hot nhất?',
                            'Thời gian đào tạo bao lâu?',

                            // Facilities category
                            'Trường có ký túc xá không?',
                            'Cơ sở vật chất như thế nào?',
                            'Thư viện có tốt không?',
                            'Phòng lab thế nào?',

                            // Career category
                            'Tỷ lệ việc làm sau tốt nghiệp?',
                            'Sinh viên ra trường làm gì?',
                            'Mức lương khởi điểm bao nhiêu?',
                            'Nghề nghiệp tương lai ra sao?',
                        ];

                        const userMessage =
                            questions[Math.floor(Math.random() * questions.length)];
                        userMessageCount++;

                        mockData.push({
                            eventType: AnalyticsEventType.MESSAGE_SENT,
                            conversationId,
                            guestId,
                            sessionId,
                            messageContent: userMessage,
                            createdAt: new Date(
                                date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                            ),
                            metadata: {
                                messageLength: userMessage.length,
                                questionCategory: Math.random() > 0.5 ? 'admission' : 'general',
                            },
                        });
                    } else {
                        // Bot response
                        const responseTime = Math.floor(Math.random() * 2000) + 800; // 800-2800ms
                        const accuracy = Math.random() * 0.15 + 0.85; // 0.85-1.0 (higher accuracy)
                        botMessageCount++;

                        const botResponses = [
                            'Thông tin tuyển sinh năm 2025 đã được cập nhật trên website chính thức của trường.',
                            'Điểm chuẩn các ngành sẽ được công bố sau khi kết thúc đợt xét tuyển.',
                            'Trường có nhiều chương trình học bổng dành cho sinh viên có thành tích xuất sắc.',
                            'Cơ sở vật chất của trường được đầu tư hiện đại, phục vụ tốt cho việc học tập.',
                            'Tỷ lệ việc làm của sinh viên tốt nghiệp đạt trên 95% trong vòng 6 tháng.',
                        ];

                        mockData.push({
                            eventType: AnalyticsEventType.MESSAGE_RECEIVED,
                            conversationId,
                            guestId,
                            sessionId,
                            messageContent:
                                botResponses[Math.floor(Math.random() * botResponses.length)],
                            createdAt: new Date(
                                date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                            ),
                            metadata: {
                                responseTime: responseTime,
                                confidence: Math.random() * 0.15 + 0.85, // 0.85-1.0
                                accuracy: accuracy,
                                retrievedDocs: Math.floor(Math.random() * 3) + 3, // 3-5 docs
                                messageLength: Math.floor(Math.random() * 300) + 200, // 200-500 chars
                            },
                        });

                        // AI Evaluation for this response (only when bot responds)
                        if (Math.random() > 0.3) {
                            // 70% chance of evaluation
                            mockData.push({
                                eventType: AnalyticsEventType.AI_EVALUATION,
                                conversationId,
                                guestId,
                                sessionId,
                                createdAt: new Date(
                                    date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                                ),
                                metadata: {
                                    accuracy: accuracy,
                                    relevance: Math.random() * 0.1 + 0.87, // 0.87-0.97
                                    helpfulness: Math.random() * 0.12 + 0.82, // 0.82-0.94
                                    sentiment:
                                        Math.random() > 0.15
                                            ? 'positive'
                                            : Math.random() > 0.7
                                                ? 'neutral'
                                                : 'negative',
                                    complexity:
                                        Math.random() > 0.6
                                            ? 'simple'
                                            : Math.random() > 0.8
                                                ? 'complex'
                                                : 'medium',
                                    category: [
                                        'admissions',
                                        'tuition_fees',
                                        'programs',
                                        'facilities',
                                        'career',
                                    ][Math.floor(Math.random() * 5)],
                                },
                            });
                        }
                    }
                }

                // User feedback (80% chance with higher ratings)
                if (Math.random() > 0.2) {
                    const rating =
                        Math.random() > 0.2
                            ? Math.random() > 0.4
                                ? 5
                                : 4 // 60% get 5 stars, 20% get 4 stars
                            : Math.random() > 0.5
                                ? 3
                                : 2; // 10% get 3 stars, 10% get 2 stars

                    mockData.push({
                        eventType: AnalyticsEventType.USER_FEEDBACK,
                        conversationId,
                        guestId,
                        sessionId,
                        createdAt: new Date(
                            date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                        ),
                        metadata: {
                            userRating: rating,
                            satisfactionScore: rating / 5.0, // Convert to 0-1 scale
                            feedbackText:
                                rating >= 4 ? 'Rất hữu ích và chính xác' : 'Ổn, cần cải thiện',
                        },
                    });
                }

                // Human handoff (5% chance - reduced)
                if (Math.random() > 0.95) {
                    mockData.push({
                        eventType: AnalyticsEventType.HUMAN_HANDOFF_REQUESTED,
                        conversationId,
                        guestId,
                        sessionId,
                        createdAt: new Date(
                            date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                        ),
                        metadata: {
                            reason: 'complex_question',
                        },
                    });
                }

                // Conversation ended
                mockData.push({
                    eventType: AnalyticsEventType.CONVERSATION_ENDED,
                    conversationId,
                    guestId,
                    sessionId,
                    createdAt: new Date(
                        date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                    ),
                    metadata: {
                        messageLength: messagesPerConv,
                        duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
                    },
                });
            }
        }

        // Sort by creation date
        mockData.sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());

        // Insert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < mockData.length; i += batchSize) {
            const batch = mockData.slice(i, i + batchSize);
            await this.repository.save(batch);
        }

        console.log(`Created ${mockData.length} analytics events for testing`);
    }
}
