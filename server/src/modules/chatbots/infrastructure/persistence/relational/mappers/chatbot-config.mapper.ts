import { ChatbotConfig } from 'src/modules/chatbots/domain/chatbot-config';
import { ChatbotConfigEntity } from '../entities/chatbot-config.entity';

export class ChatbotConfigMapper {
  static toDomain(raw: ChatbotConfigEntity): ChatbotConfig {
    const domainEntity = new ChatbotConfig();
    domainEntity.id = raw.id;
    domainEntity.type = raw.type;
    domainEntity.llmConfig = raw.llmConfig;
    domainEntity.chatConfig = raw.chatConfig;
    domainEntity.personality = raw.personality;
    domainEntity.appearance = raw.appearance;
    domainEntity.welcomeSettings = raw.welcomeSettings;
    domainEntity.humanHandoff = raw.humanHandoff;
    domainEntity.contactInfo = raw.contactInfo;
    domainEntity.environment = raw.environment;
    domainEntity.debug = raw.debug;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ChatbotConfig): ChatbotConfigEntity {
    const persistenceEntity = new ChatbotConfigEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.type = domainEntity.type;
    persistenceEntity.llmConfig = domainEntity.llmConfig;
    persistenceEntity.chatConfig = domainEntity.chatConfig;
    persistenceEntity.personality = domainEntity.personality;
    persistenceEntity.appearance = domainEntity.appearance;
    persistenceEntity.welcomeSettings = domainEntity.welcomeSettings;
    persistenceEntity.humanHandoff = domainEntity.humanHandoff;
    persistenceEntity.contactInfo = domainEntity.contactInfo;
    persistenceEntity.environment = domainEntity.environment;
    persistenceEntity.debug = domainEntity.debug;
    persistenceEntity.isActive = domainEntity.isActive;

    if (domainEntity.createdAt) {
      persistenceEntity.createdAt = domainEntity.createdAt;
    }

    if (domainEntity.updatedAt) {
      persistenceEntity.updatedAt = domainEntity.updatedAt;
    }

    return persistenceEntity;
  }
}
