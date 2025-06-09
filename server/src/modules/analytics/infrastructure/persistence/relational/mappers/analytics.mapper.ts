import { Analytics } from '../../../../domain/analytics';
import { AnalyticsEntity } from '../entities/analytics.entity';

export class AnalyticsMapper {
  static toDomain(raw: AnalyticsEntity): Analytics {
    const domainEntity = new Analytics();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Analytics): AnalyticsEntity {
    const persistenceEntity = new AnalyticsEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
