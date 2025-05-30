import { Exclude, Expose } from 'class-transformer';
import { FileType } from '../../files/domain/file';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { VerifiedEnum } from '../../statuses/statuses.enum';

const idType = Number;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: number;

  // @Expose({ groups: ['me', 'admin'] })
  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  previousPassword?: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    type: String,
    description: 'Two-factor authentication secret',
    required: false,
  })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Whether two-factor authentication is enabled',
    default: false,
  })
  @Expose({ groups: ['me', 'admin'] })
  isTwoFactorEnabled: boolean;

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;

  @ApiProperty({
    type: String,
    example: '',
  })
  avatar: string;

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty({
    type: Number,
  })
  isVerified?: VerifiedEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
