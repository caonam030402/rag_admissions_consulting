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
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<DataSource[]> {
    const entities = await this.dataSourceRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DataSourceMapper.toDomain(entity));
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
