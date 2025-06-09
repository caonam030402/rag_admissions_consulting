import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEntity } from '../entities/analytics.entity';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { Analytics } from '../../../../domain/analytics';
import { AnalyticsRepository } from '../../analytics.repository';
import { AnalyticsMapper } from '../mappers/analytics.mapper';
import { IPaginationOptions } from '../../../../../../utils/types/pagination-options';

@Injectable()
export class AnalyticsRelationalRepository implements AnalyticsRepository {
  constructor(
    @InjectRepository(AnalyticsEntity)
    private readonly analyticsRepository: Repository<AnalyticsEntity>,
  ) {}

  async create(data: Analytics): Promise<Analytics> {
    const persistenceModel = AnalyticsMapper.toPersistence(data);
    const newEntity = await this.analyticsRepository.save(
      this.analyticsRepository.create(persistenceModel),
    );
    return AnalyticsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Analytics[]> {
    const entities = await this.analyticsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AnalyticsMapper.toDomain(entity));
  }

  async findById(id: Analytics['id']): Promise<NullableType<Analytics>> {
    const entity = await this.analyticsRepository.findOne({
      where: { id },
    });

    return entity ? AnalyticsMapper.toDomain(entity) : null;
  }

  async update(
    id: Analytics['id'],
    payload: Partial<Analytics>,
  ): Promise<Analytics> {
    const entity = await this.analyticsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.analyticsRepository.save(
      this.analyticsRepository.create(
        AnalyticsMapper.toPersistence({
          ...AnalyticsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return AnalyticsMapper.toDomain(updatedEntity);
  }

  async remove(id: Analytics['id']): Promise<void> {
    await this.analyticsRepository.delete(id);
  }
}
