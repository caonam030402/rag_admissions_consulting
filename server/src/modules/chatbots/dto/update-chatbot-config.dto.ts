import { PartialType } from '@nestjs/swagger';
import { CreateChatbotConfigDto } from './create-chatbot-config.dto';

export class UpdateChatbotConfigDto extends PartialType(
  CreateChatbotConfigDto,
) {}

// Section-specific update DTOs for better type safety
export class UpdateBasicInfoDto {
  personality?: Partial<CreateChatbotConfigDto['personality']>;
  llmConfig?: Partial<CreateChatbotConfigDto['llmConfig']>;
}

export class UpdateAppearanceDto {
  appearance?: Partial<CreateChatbotConfigDto['appearance']>;
}

export class UpdateWelcomeSettingsDto {
  welcomeSettings?: Partial<CreateChatbotConfigDto['welcomeSettings']>;
}

export class UpdateHumanHandoffDto {
  humanHandoff?: Partial<CreateChatbotConfigDto['humanHandoff']>;
}
