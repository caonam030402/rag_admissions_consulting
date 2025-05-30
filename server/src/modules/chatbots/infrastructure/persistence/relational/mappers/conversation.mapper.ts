import { Conversation } from 'src/modules/chatbots/domain/conversation';
import { ConversationEntity } from 'src/modules/chatbots/infrastructure/persistence/relational/entities/conversation.entity';

export class ConversationMapper {
  static toDomain(raw: ConversationEntity): Conversation {
    const domainEntity = new Conversation();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.guestId = raw.guestId;
    domainEntity.title = raw.title;
    domainEntity.isActive = raw.isActive;
    domainEntity.lastMessageAt = raw.lastMessageAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Conversation): ConversationEntity {
    const persistenceEntity = new ConversationEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.guestId = domainEntity.guestId;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.lastMessageAt = domainEntity.lastMessageAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
