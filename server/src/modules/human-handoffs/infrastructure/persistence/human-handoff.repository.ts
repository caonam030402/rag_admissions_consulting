import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { HumanHandoff } from '../../domain/human-handoff';

export abstract class HumanHandoffRepository {
  abstract create(
    data: Omit<HumanHandoff, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HumanHandoff>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<HumanHandoff[]>;

  abstract findById(
    id: HumanHandoff['id'],
  ): Promise<NullableType<HumanHandoff>>;

  abstract update(
    id: HumanHandoff['id'],
    payload: DeepPartial<HumanHandoff>,
  ): Promise<HumanHandoff | null>;

  abstract remove(id: HumanHandoff['id']): Promise<void>;
}
