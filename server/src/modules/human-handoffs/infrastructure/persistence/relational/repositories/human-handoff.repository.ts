import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HumanHandoffEntity } from '../entities/human-handoff.entity';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { HumanHandoff } from '../../../../domain/human-handoff';
import { HumanHandoffRepository } from '../../human-handoff.repository';
import { HumanHandoffMapper } from '../mappers/human-handoff.mapper';
import { IPaginationOptions } from '../../../../../../utils/types/pagination-options';

@Injectable()
export class HumanHandoffRelationalRepository
  implements HumanHandoffRepository
{
  constructor(
    @InjectRepository(HumanHandoffEntity)
    private readonly humanHandoffRepository: Repository<HumanHandoffEntity>,
  ) {}

  async create(data: HumanHandoff): Promise<HumanHandoff> {
    const persistenceModel = HumanHandoffMapper.toPersistence(data);
    const newEntity = await this.humanHandoffRepository.save(
      this.humanHandoffRepository.create(persistenceModel),
    );
    return HumanHandoffMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<HumanHandoff[]> {
    const entities = await this.humanHandoffRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => HumanHandoffMapper.toDomain(entity));
  }

  async findById(id: HumanHandoff['id']): Promise<NullableType<HumanHandoff>> {
    const entity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    return entity ? HumanHandoffMapper.toDomain(entity) : null;
  }

  async update(
    id: HumanHandoff['id'],
    payload: Partial<HumanHandoff>,
  ): Promise<HumanHandoff> {
    const entity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.humanHandoffRepository.save(
      this.humanHandoffRepository.create(
        HumanHandoffMapper.toPersistence({
          ...HumanHandoffMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return HumanHandoffMapper.toDomain(updatedEntity);
  }

  async remove(id: HumanHandoff['id']): Promise<void> {
    await this.humanHandoffRepository.delete(id);
  }
}
