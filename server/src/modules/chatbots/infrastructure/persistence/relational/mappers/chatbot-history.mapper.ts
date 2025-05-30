import { ChatbotHistory as ChatbotHistoryDomain } from '../../../../../../modules/chatbots/domain/chatbot-history';
import { ChatbotHistoryEntity } from '../entities/chatbot-history.entity';

export class ChatbotHistoryMapper {
  static toDomain(raw: ChatbotHistoryEntity): ChatbotHistoryDomain {
    const domainEntity = new ChatbotHistoryDomain();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.guestId = raw.guestId;
    domainEntity.conversationId = raw.conversationId;
    domainEntity.role = raw.role;
    domainEntity.content = raw.content;
    domainEntity.title = raw.title;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(
    domainEntity: ChatbotHistoryDomain,
  ): ChatbotHistoryEntity {
    const persistenceEntity = new ChatbotHistoryEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.guestId = domainEntity.guestId;
    persistenceEntity.conversationId = domainEntity.conversationId;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.content = domainEntity.content;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
