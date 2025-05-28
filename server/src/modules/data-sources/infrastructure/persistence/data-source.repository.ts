import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { DataSource } from '../../domain/data-source';

export abstract class DataSourceRepository {
  abstract create(
    data: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DataSource>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<DataSource[]>;

  abstract findById(id: DataSource['id']): Promise<NullableType<DataSource>>;

  abstract update(
    id: DataSource['id'],
    payload: DeepPartial<DataSource>,
  ): Promise<DataSource | null>;

  abstract remove(id: DataSource['id']): Promise<void>;
}
