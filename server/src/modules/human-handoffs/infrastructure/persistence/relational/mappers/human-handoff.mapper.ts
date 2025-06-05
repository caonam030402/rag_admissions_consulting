import { HumanHandoff } from '../../../../domain/human-handoff';
import { HumanHandoffEntity } from '../entities/human-handoff.entity';

export class HumanHandoffMapper {
  static toDomain(entity: HumanHandoffEntity): HumanHandoff {
    const domainEntity = new HumanHandoff();
    domainEntity.id = entity.id;
    domainEntity.conversationId = entity.conversationId;
    domainEntity.userId = entity.userId;
    domainEntity.guestId = entity.guestId;
    domainEntity.adminId = entity.adminId;
    domainEntity.status = entity.status;
    domainEntity.initialMessage = entity.initialMessage;
    domainEntity.userProfile = entity.userProfile;
    domainEntity.requestedAt = entity.requestedAt;
    domainEntity.connectedAt = entity.connectedAt;
    domainEntity.endedAt = entity.endedAt;
    domainEntity.createdAt = entity.createdAt;
    domainEntity.updatedAt = entity.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: HumanHandoff): HumanHandoffEntity {
    const persistenceEntity = new HumanHandoffEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.conversationId = domainEntity.conversationId;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.guestId = domainEntity.guestId;
    persistenceEntity.adminId = domainEntity.adminId;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.initialMessage = domainEntity.initialMessage;
    persistenceEntity.userProfile = domainEntity.userProfile;
    persistenceEntity.requestedAt = domainEntity.requestedAt;
    persistenceEntity.connectedAt = domainEntity.connectedAt;
    persistenceEntity.endedAt = domainEntity.endedAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
