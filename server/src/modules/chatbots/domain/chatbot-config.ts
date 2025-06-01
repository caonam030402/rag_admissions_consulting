import { ApiProperty } from '@nestjs/swagger';
import {
    ConfigType,
    ModelType,
    PersonalityType,
} from 'src/common/enums/chatbot.enum';

export class LLMConfig {
    @ApiProperty({ enum: ModelType, description: 'LLM model type' })
    defaultModel: ModelType;

    @ApiProperty({ description: 'OpenAI API key', required: false })
    openaiApiKey?: string;

    @ApiProperty({ description: 'Gemini API key', required: false })
    geminiApiKey?: string;

    @ApiProperty({
        description: 'Maximum tokens for LLM response',
        default: 2048,
    })
    maxTokens: number;

    @ApiProperty({
        description: 'Temperature for LLM response',
        default: 0.7,
        minimum: 0,
        maximum: 1,
    })
    temperature: number;
}

export class ChatConfig {
    @ApiProperty({
        description: 'Maximum context length in messages',
        default: 20,
    })
    maxContextLength: number;

    @ApiProperty({ description: 'Context window in minutes', default: 30 })
    contextWindowMinutes: number;

    @ApiProperty({ description: 'Maximum response tokens', default: 1024 })
    maxResponseTokens: number;

    @ApiProperty({ description: 'Stream delay in milliseconds', default: 50 })
    streamDelayMs: number;
}

export class ChatbotPersonality {
    @ApiProperty({ description: 'Chatbot name' })
    name: string;

    @ApiProperty({ description: 'Chatbot persona description' })
    persona: string;

    @ApiProperty({ enum: PersonalityType, description: 'Personality type' })
    personality: PersonalityType;

    @ApiProperty({ description: 'Avatar URL', required: false })
    avatar?: string;

    @ApiProperty({
        description: 'Creativity level',
        default: 0.2,
        minimum: 0,
        maximum: 1,
    })
    creativityLevel: number;
}

export class AppearanceConfig {
    @ApiProperty({ description: 'Primary theme color', default: '#3B82F6' })
    primaryColor: string;

    @ApiProperty({ description: 'Secondary theme color', default: '#6B7280' })
    secondaryColor: string;

    @ApiProperty({ description: 'Chat bubble style', default: 'rounded' })
    chatBubbleStyle: string;

    @ApiProperty({ description: 'Font family', default: 'Inter' })
    fontFamily: string;

    @ApiProperty({ description: 'Font size', default: 14 })
    fontSize: number;

    @ApiProperty({ description: 'Dark mode enabled', default: false })
    darkMode: boolean;

    @ApiProperty({ description: 'Show chatbot avatar', default: true })
    showAvatar: boolean;

    @ApiProperty({ description: 'Chat window position', default: 'bottom-right' })
    windowPosition: string;
}

export class WelcomeSettings {
    @ApiProperty({ description: 'Welcome message text' })
    welcomeMessage: string;

    @ApiProperty({ description: 'Show welcome message', default: true })
    showWelcomeMessage: boolean;

    @ApiProperty({ description: 'Auto greet new users', default: true })
    autoGreet: boolean;

    @ApiProperty({ description: 'Greeting delay in seconds', default: 2 })
    greetingDelay: number;

    @ApiProperty({
        description: 'Quick start buttons',
        type: [String],
        required: false,
    })
    quickStartButtons?: string[];

    @ApiProperty({ description: 'Show suggested questions', default: true })
    showSuggestedQuestions: boolean;

    @ApiProperty({
        description: 'Suggested questions list',
        type: [String],
        required: false,
    })
    suggestedQuestions?: string[];
}

export class HumanHandoffConfig {
    @ApiProperty({ description: 'Enable human handoff', default: false })
    enabled: boolean;

    @ApiProperty({
        description: 'Trigger keywords for escalation',
        type: [String],
        required: false,
    })
    triggerKeywords?: string[];

    @ApiProperty({
        description: 'Human agent availability message',
        required: false,
    })
    agentAvailableMessage?: string;

    @ApiProperty({
        description: 'Human agent unavailable message',
        required: false,
    })
    agentUnavailableMessage?: string;

    @ApiProperty({
        description: 'Maximum wait time before escalation in minutes',
        default: 30,
    })
    maxWaitTime: number;

    @ApiProperty({ description: 'Enable escalation button', default: true })
    showEscalationButton: boolean;

    @ApiProperty({
        description: 'Escalation button text',
        default: 'Talk to human agent',
    })
    escalationButtonText: string;
}

export class ContactInfo {
    @ApiProperty({ description: 'Hotline number' })
    hotline: string;

    @ApiProperty({ description: 'Email address' })
    email: string;

    @ApiProperty({ description: 'Website URL' })
    website: string;

    @ApiProperty({ description: 'Physical address' })
    address: string;
}

export class ChatbotConfig {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({
        enum: ConfigType,
        description: 'Config type: default or override',
    })
    type: ConfigType;

    @ApiProperty({ type: LLMConfig, description: 'LLM configuration' })
    llmConfig: LLMConfig;

    @ApiProperty({ type: ChatConfig, description: 'Chat configuration' })
    chatConfig: ChatConfig;

    @ApiProperty({
        type: ChatbotPersonality,
        description: 'Chatbot personality settings',
    })
    personality: ChatbotPersonality;

    @ApiProperty({
        type: AppearanceConfig,
        description: 'Appearance configuration',
    })
    appearance: AppearanceConfig;

    @ApiProperty({ type: WelcomeSettings, description: 'Welcome settings' })
    welcomeSettings: WelcomeSettings;

    @ApiProperty({
        type: HumanHandoffConfig,
        description: 'Human handoff configuration',
    })
    humanHandoff: HumanHandoffConfig;

    @ApiProperty({ type: ContactInfo, description: 'Contact information' })
    contactInfo: ContactInfo;

    @ApiProperty({
        description: 'Environment: development, production',
        default: 'development',
    })
    environment: string;

    @ApiProperty({ description: 'Debug mode enabled', default: false })
    debug: boolean;

    @ApiProperty({ description: 'Config is active', default: true })
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
