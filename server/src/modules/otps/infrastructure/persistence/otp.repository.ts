import { DeepPartial } from 'typeorm';
import { NullableType } from '../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { Otp } from '../../domain/otp';

export abstract class OtpRepository {
  abstract create(
    data: Omit<Otp, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Otp>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Otp[]>;

  abstract findById(id: Otp['id']): Promise<NullableType<Otp>>;

  abstract update(
    id: Otp['id'],
    payload: DeepPartial<Otp>,
  ): Promise<Otp | null>;

  abstract remove(id: Otp['id']): Promise<void>;

  abstract findByUser(user: Otp['user']): Promise<NullableType<Otp>>;
}
