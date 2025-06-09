import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ConfigType,
  ModelType,
  PersonalityType,
} from 'src/common/enums/chatbot.enum';

@Entity({
  name: 'chatbot_configs',
})
export class ChatbotConfigEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ConfigType })
  @Column({
    type: 'enum',
    enum: ConfigType,
    default: ConfigType.DEFAULT,
  })
  type: ConfigType;

  @ApiProperty()
  @Column({ type: 'jsonb' })
  llmConfig: {
    defaultModel: ModelType;
    openaiApiKey?: string;
    geminiApiKey?: string;
    maxTokens: number;
    temperature: number;
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  chatConfig: {
    maxContextLength: number;
    contextWindowMinutes: number;
    maxResponseTokens: number;
    streamDelayMs: number;
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  personality: {
    name: string;
    persona: string;
    personality: PersonalityType;
    avatar?: string;
    creativityLevel: number;
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    chatBubbleStyle: string;
    fontFamily: string;
    fontSize: number;
    darkMode: boolean;
    showAvatar: boolean;
    windowPosition: string;
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  welcomeSettings: {
    welcomeMessage: string;
    showWelcomeMessage: boolean;
    autoGreet: boolean;
    greetingDelay: number;
    quickStartButtons?: string[];
    showSuggestedQuestions: boolean;
    suggestedQuestions?: string[];
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  humanHandoff: {
    enabled: boolean;
    agentAlias: string;
    triggerPattern: string;
    timezone: string;
    workingDays: string[];
    workingHours: {
      sunday?: { start: string; end: string; hours?: string };
      monday?: { start: string; end: string; hours?: string };
      tuesday?: { start: string; end: string; hours?: string };
      wednesday?: { start: string; end: string; hours?: string };
      thursday?: { start: string; end: string; hours?: string };
      friday?: { start: string; end: string; hours?: string };
      saturday?: { start: string; end: string; hours?: string };
    };
    timeoutDuration: number;
    triggerKeywords?: string[];
    agentAvailableMessage?: string;
    agentUnavailableMessage?: string;
    maxWaitTime: number;
    showEscalationButton: boolean;
    escalationButtonText: string;
  };

  @ApiProperty()
  @Column({ type: 'jsonb' })
  contactInfo: {
    hotline: string;
    email: string;
    website: string;
    address: string;
  };

  @ApiProperty()
  @Column({ default: 'development' })
  environment: string;

  @ApiProperty()
  @Column({ default: false })
  debug: boolean;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
