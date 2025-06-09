import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { Analytics } from '../../domain/analytics';

export abstract class AnalyticsRepository {
  abstract create(
    data: Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Analytics>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Analytics[]>;

  abstract findById(id: Analytics['id']): Promise<NullableType<Analytics>>;

  abstract update(
    id: Analytics['id'],
    payload: DeepPartial<Analytics>,
  ): Promise<Analytics | null>;

  abstract remove(id: Analytics['id']): Promise<void>;
}
