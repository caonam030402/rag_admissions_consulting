import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSourceEntity } from '../entities/data-source.entity';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { DataSource } from '../../../../domain/data-source';
import { DataSourceRepository } from '../../data-source.repository';
import { DataSourceMapper } from '../mappers/data-source.mapper';
import { IPaginationOptions } from '../../../../../../utils/types/pagination-options';

@Injectable()
export class DataSourceRelationalRepository implements DataSourceRepository {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
  ) {}

  async create(data: DataSource): Promise<DataSource> {
    const persistenceModel = DataSourceMapper.toPersistence(data);
    const newEntity = await this.dataSourceRepository.save(
      this.dataSourceRepository.create(persistenceModel),
    );
    return DataSourceMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    searchOptions,
  }: {
    paginationOptions: IPaginationOptions;
    searchOptions?: {
      search?: string;
      source?: string;
      status?: string;
    };
  }): Promise<{ data: DataSource[]; totalCount: number }> {
    const queryBuilder =
      this.dataSourceRepository.createQueryBuilder('dataSource');

    // Apply search filters if provided
    if (searchOptions?.search) {
      queryBuilder.andWhere(
        '(dataSource.name ILIKE :search OR dataSource.description ILIKE :search)',
        { search: `%${searchOptions.search}%` },
      );
    }

    if (searchOptions?.source && searchOptions.source !== 'all') {
      // Map human-readable source values to enum values
      let typeValue: string;
      switch (searchOptions.source) {
        case 'Website':
          typeValue = 'web_crawl';
          break;
        case 'File':
          typeValue = 'file_upload';
          break;
        case 'Manual':
          typeValue = 'manual_input';
          break;
        case 'API':
          typeValue = 'api_import';
          break;
        default:
          typeValue = searchOptions.source;
      }
      queryBuilder.andWhere('dataSource.type = :type', { type: typeValue });
    }

    if (searchOptions?.status && searchOptions.status !== 'all') {
      queryBuilder.andWhere('dataSource.status = :status', {
        status: searchOptions.status,
      });
    }

    // Apply pagination and ordering
    const [entities, totalCount] = await queryBuilder
      .orderBy('dataSource.createdAt', 'DESC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => DataSourceMapper.toDomain(entity)),
      totalCount,
    };
  }

  async findById(id: DataSource['id']): Promise<NullableType<DataSource>> {
    const entity = await this.dataSourceRepository.findOne({
      where: { id },
    });

    return entity ? DataSourceMapper.toDomain(entity) : null;
  }

  async update(
    id: DataSource['id'],
    payload: Partial<DataSource>,
  ): Promise<DataSource> {
    const entity = await this.dataSourceRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.dataSourceRepository.save(
      this.dataSourceRepository.create(
        DataSourceMapper.toPersistence({
          ...DataSourceMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return DataSourceMapper.toDomain(updatedEntity);
  }

  async remove(id: DataSource['id']): Promise<void> {
    await this.dataSourceRepository.delete(id);
  }
}
