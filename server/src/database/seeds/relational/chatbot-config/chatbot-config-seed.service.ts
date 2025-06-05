import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotConfigEntity } from 'src/modules/chatbots/infrastructure/persistence/relational/entities/chatbot-config.entity';
import {
  ConfigType,
  ModelType,
  PersonalityType,
} from 'src/common/enums/chatbot.enum';

@Injectable()
export class ChatbotConfigSeedService {
  constructor(
    @InjectRepository(ChatbotConfigEntity)
    private repository: Repository<ChatbotConfigEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save({
        type: ConfigType.DEFAULT,
        llmConfig: {
          defaultModel: ModelType.GEMINI_PRO,
          maxTokens: 2048,
          temperature: 0.7,
        },
        chatConfig: {
          maxContextLength: 20,
          contextWindowMinutes: 30,
          maxResponseTokens: 1024,
          streamDelayMs: 50,
        },
        personality: {
          name: 'AI Assistant',
          persona: `You are an intelligent and helpful AI assistant for admissions consulting. 
You provide accurate, professional guidance about university admissions, application processes, 
and academic programs. You are friendly, knowledgeable, and always aim to be helpful while 
maintaining a professional demeanor.`,
          personality: PersonalityType.PROFESSIONAL,
          creativityLevel: 0.2,
        },
        appearance: {
          primaryColor: '#3B82F6',
          secondaryColor: '#6B7280',
          chatBubbleStyle: 'rounded',
          fontFamily: 'Inter',
          fontSize: 14,
          darkMode: false,
          showAvatar: true,
          windowPosition: 'bottom-right',
        },
        welcomeSettings: {
          welcomeMessage:
            "Hello! I'm here to help you with your university admissions questions. How can I assist you today?",
          showWelcomeMessage: true,
          autoGreet: true,
          greetingDelay: 2,
          showSuggestedQuestions: true,
          suggestedQuestions: [
            'What are the admission requirements for engineering programs?',
            'How do I prepare for university entrance exams?',
            'What documents do I need for my application?',
            'Can you help me choose the right university?',
            'What are the scholarship opportunities available?',
          ],
        },
        humanHandoff: {
          enabled: false,
          maxWaitTime: 30,
          showEscalationButton: true,
          escalationButtonText: 'Talk to human counselor',
          agentAvailableMessage:
            'A human counselor is now available to help you.',
          agentUnavailableMessage:
            "All counselors are currently busy. Please leave a message and we'll get back to you.",
        },
        contactInfo: {
          hotline: '+84-123-456-789',
          email: 'admissions@university.edu',
          website: 'https://admissions.university.edu',
          address: '123 University Street, Academic City, AC 12345',
        },
        environment: 'development',
        debug: false,
        isActive: true,
      });

      console.log('Default chatbot configuration seeded successfully');
    }
  }
}
