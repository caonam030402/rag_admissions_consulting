import { DataSource } from '../../../../domain/data-source';
import {
  DataSourceEntity,
  DataSourceType,
  DataSourceStatus,
} from '../entities/data-source.entity';

export class DataSourceMapper {
  static toDomain(raw: DataSourceEntity): DataSource {
    const domainEntity = new DataSource();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.type = raw.type as string;
    domainEntity.sourceUrl = raw.sourceUrl;
    domainEntity.filePath = raw.filePath;
    domainEntity.status = raw.status as string;
    domainEntity.documentsCount = raw.documentsCount;
    domainEntity.vectorsCount = raw.vectorsCount;
    domainEntity.uploadedBy = raw.uploadedBy;
    domainEntity.uploaderEmail = raw.uploaderEmail;
    domainEntity.processingStartedAt = raw.processingStartedAt;
    domainEntity.processingCompletedAt = raw.processingCompletedAt;
    domainEntity.errorMessage = raw.errorMessage;
    domainEntity.metadata = raw.metadata;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: DataSource): DataSourceEntity {
    const persistenceEntity = new DataSourceEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.type = domainEntity.type as DataSourceType;
    persistenceEntity.sourceUrl = domainEntity.sourceUrl;
    persistenceEntity.filePath = domainEntity.filePath;
    persistenceEntity.status = domainEntity.status as DataSourceStatus;
    persistenceEntity.documentsCount = domainEntity.documentsCount;
    persistenceEntity.vectorsCount = domainEntity.vectorsCount;
    persistenceEntity.uploadedBy = domainEntity.uploadedBy;
    persistenceEntity.uploaderEmail = domainEntity.uploaderEmail;
    persistenceEntity.processingStartedAt = domainEntity.processingStartedAt;
    persistenceEntity.processingCompletedAt = domainEntity.processingCompletedAt;
    persistenceEntity.errorMessage = domainEntity.errorMessage;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
