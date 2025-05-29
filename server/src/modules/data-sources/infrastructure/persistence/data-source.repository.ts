import { DataSource } from '../../domain/data-source';
import { NullableType } from '../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';

export abstract class DataSourceRepository {
  abstract create(
    data: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DataSource>;

  abstract findAllWithPagination({
    paginationOptions,
    searchOptions,
  }: {
    paginationOptions: IPaginationOptions;
    searchOptions?: {
      search?: string;
      source?: string;
      status?: string;
    };
  }): Promise<{ data: DataSource[]; totalCount: number }>;

  abstract findById(id: DataSource['id']): Promise<NullableType<DataSource>>;

  abstract update(
    id: DataSource['id'],
    payload: Partial<DataSource>,
  ): Promise<DataSource>;

  abstract remove(id: DataSource['id']): Promise<void>;
}
