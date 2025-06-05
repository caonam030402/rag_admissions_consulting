import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
  IsUrl,
  IsArray,
  IsHexColor,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConfigType,
  ModelType,
  PersonalityType,
} from 'src/common/enums/chatbot.enum';

export class CreateLLMConfigDto {
  @ApiProperty({ enum: ModelType, description: 'LLM model type' })
  @IsEnum(ModelType)
  defaultModel: ModelType;

  @ApiProperty({ description: 'OpenAI API key', required: false })
  @IsString()
  @IsOptional()
  openaiApiKey?: string;

  @ApiProperty({ description: 'Gemini API key', required: false })
  @IsString()
  @IsOptional()
  geminiApiKey?: string;

  @ApiProperty({
    description: 'Maximum tokens for LLM response',
    default: 2048,
  })
  @IsNumber()
  @Min(1)
  @Max(8192)
  maxTokens: number = 2048;

  @ApiProperty({ description: 'Temperature for LLM response', default: 0.7 })
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number = 0.7;
}

export class CreateChatConfigDto {
  @ApiProperty({
    description: 'Maximum context length in messages',
    default: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxContextLength: number = 20;

  @ApiProperty({ description: 'Context window in minutes', default: 30 })
  @IsNumber()
  @Min(1)
  @Max(1440)
  contextWindowMinutes: number = 30;

  @ApiProperty({ description: 'Maximum response tokens', default: 1024 })
  @IsNumber()
  @Min(1)
  @Max(4096)
  maxResponseTokens: number = 1024;

  @ApiProperty({ description: 'Stream delay in milliseconds', default: 50 })
  @IsNumber()
  @Min(0)
  @Max(1000)
  streamDelayMs: number = 50;
}

export class CreateChatbotPersonalityDto {
  @ApiProperty({ description: 'Chatbot name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Chatbot persona description' })
  @IsString()
  @IsNotEmpty()
  persona: string;

  @ApiProperty({ enum: PersonalityType, description: 'Personality type' })
  @IsEnum(PersonalityType)
  personality: PersonalityType;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Creativity level', default: 0.2 })
  @IsNumber()
  @Min(0)
  @Max(1)
  creativityLevel: number = 0.2;
}

export class CreateAppearanceConfigDto {
  @ApiProperty({
    description: 'Primary theme color',
    default: '#3B82F6',
  })
  @IsHexColor()
  primaryColor: string = '#3B82F6';

  @ApiProperty({
    description: 'Secondary theme color',
    default: '#6B7280',
  })
  @IsHexColor()
  secondaryColor: string = '#6B7280';

  @ApiProperty({
    description: 'Chat bubble style',
    default: 'rounded',
  })
  @IsString()
  chatBubbleStyle: string = 'rounded';

  @ApiProperty({
    description: 'Font family',
    default: 'Inter',
  })
  @IsString()
  fontFamily: string = 'Inter';

  @ApiProperty({
    description: 'Font size',
    default: 14,
  })
  @IsNumber()
  @Min(10)
  @Max(24)
  fontSize: number = 14;

  @ApiProperty({
    description: 'Dark mode enabled',
    default: false,
  })
  @IsBoolean()
  darkMode: boolean = false;

  @ApiProperty({
    description: 'Show chatbot avatar',
    default: true,
  })
  @IsBoolean()
  showAvatar: boolean = true;

  @ApiProperty({
    description: 'Chat window position',
    default: 'bottom-right',
  })
  @IsString()
  windowPosition: string = 'bottom-right';
}

export class CreateWelcomeSettingsDto {
  @ApiProperty({ description: 'Welcome message text' })
  @IsString()
  @IsNotEmpty()
  welcomeMessage: string;

  @ApiProperty({
    description: 'Show welcome message',
    default: true,
  })
  @IsBoolean()
  showWelcomeMessage: boolean = true;

  @ApiProperty({
    description: 'Auto greet new users',
    default: true,
  })
  @IsBoolean()
  autoGreet: boolean = true;

  @ApiProperty({
    description: 'Greeting delay in seconds',
    default: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(60)
  greetingDelay: number = 2;

  @ApiProperty({
    description: 'Quick start buttons',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  quickStartButtons?: string[];

  @ApiProperty({
    description: 'Show suggested questions',
    default: true,
  })
  @IsBoolean()
  showSuggestedQuestions: boolean = true;

  @ApiProperty({
    description: 'Suggested questions list',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  suggestedQuestions?: string[];
}

export class CreateHumanHandoffConfigDto {
  @ApiProperty({
    description: 'Enable human handoff',
    default: false,
  })
  @IsBoolean()
  enabled: boolean = false;

  @ApiProperty({
    description: 'Trigger keywords for escalation',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  triggerKeywords?: string[];

  @ApiProperty({
    description: 'Human agent availability message',
    required: false,
  })
  @IsString()
  @IsOptional()
  agentAvailableMessage?: string;

  @ApiProperty({
    description: 'Human agent unavailable message',
    required: false,
  })
  @IsString()
  @IsOptional()
  agentUnavailableMessage?: string;

  @ApiProperty({
    description: 'Maximum wait time before escalation in minutes',
    default: 30,
  })
  @IsNumber()
  @Min(1)
  @Max(1440)
  maxWaitTime: number = 30;

  @ApiProperty({
    description: 'Enable escalation button',
    default: true,
  })
  @IsBoolean()
  showEscalationButton: boolean = true;

  @ApiProperty({
    description: 'Escalation button text',
    default: 'Talk to human agent',
  })
  @IsString()
  escalationButtonText: string = 'Talk to human agent';
}

export class CreateContactInfoDto {
  @ApiProperty({ description: 'Hotline number' })
  @IsString()
  @IsNotEmpty()
  hotline: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Website URL' })
  @IsUrl()
  @IsNotEmpty()
  website: string;

  @ApiProperty({ description: 'Physical address' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateChatbotConfigDto {
  @ApiProperty({
    enum: ConfigType,
    description: 'Config type: default or override',
  })
  @IsEnum(ConfigType)
  type: ConfigType;

  @ApiProperty({ type: CreateLLMConfigDto, description: 'LLM configuration' })
  @ValidateNested()
  @Type(() => CreateLLMConfigDto)
  llmConfig: CreateLLMConfigDto;

  @ApiProperty({ type: CreateChatConfigDto, description: 'Chat configuration' })
  @ValidateNested()
  @Type(() => CreateChatConfigDto)
  chatConfig: CreateChatConfigDto;

  @ApiProperty({
    type: CreateChatbotPersonalityDto,
    description: 'Chatbot personality settings',
  })
  @ValidateNested()
  @Type(() => CreateChatbotPersonalityDto)
  personality: CreateChatbotPersonalityDto;

  @ApiProperty({
    type: CreateAppearanceConfigDto,
    description: 'Appearance configuration',
  })
  @ValidateNested()
  @Type(() => CreateAppearanceConfigDto)
  appearance: CreateAppearanceConfigDto;

  @ApiProperty({
    type: CreateWelcomeSettingsDto,
    description: 'Welcome settings',
  })
  @ValidateNested()
  @Type(() => CreateWelcomeSettingsDto)
  welcomeSettings: CreateWelcomeSettingsDto;

  @ApiProperty({
    type: CreateHumanHandoffConfigDto,
    description: 'Human handoff configuration',
  })
  @ValidateNested()
  @Type(() => CreateHumanHandoffConfigDto)
  humanHandoff: CreateHumanHandoffConfigDto;

  @ApiProperty({
    type: CreateContactInfoDto,
    description: 'Contact information',
  })
  @ValidateNested()
  @Type(() => CreateContactInfoDto)
  contactInfo: CreateContactInfoDto;

  @ApiProperty({
    description: 'Environment: development, production',
    default: 'development',
  })
  @IsString()
  @IsOptional()
  environment?: string = 'development';

  @ApiProperty({ description: 'Debug mode enabled', default: false })
  @IsBoolean()
  @IsOptional()
  debug?: boolean = false;

  @ApiProperty({ description: 'Config is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
