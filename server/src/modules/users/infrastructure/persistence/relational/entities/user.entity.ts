import {
  Column,
  AfterLoad,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  BeforeInsert,
} from 'typeorm';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';

import { AuthProvidersEnum } from '../../../../../auth/auth-providers.enum';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';

// We use class-transformer in ORM entity and domain entity.
// We duplicate these rules because you can choose not to use adapters
// in your project and return an ORM entity directly in response.
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VerifiedEnum } from '../../../../../statuses/statuses.enum';
import { generateAvatar } from '../../../../../../utils/avatart-default';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword?: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: Number,
  })
  @Column({ enum: VerifiedEnum, nullable: true })
  isVerified?: VerifiedEnum;

  @ApiProperty({
    type: String,
  })
  @Column({ enum: VerifiedEnum, nullable: true })
  avatar: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({
    type: String,
    description: 'Two-factor authentication secret',
    required: false,
  })
  @Column({ type: String, nullable: true })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Whether two-factor authentication is enabled',
    default: false,
  })
  @Column({ type: Boolean, default: false })
  @Expose({ groups: ['me', 'admin'] })
  isTwoFactorEnabled: boolean;

  @ApiProperty({
    type: () => FileEntity,
  })
  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
  })
  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ApiProperty({
    type: () => StatusEntity,
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  setDefaultAvatar() {
    if (!this.avatar) {
      this.avatar = generateAvatar({ email: this.email || '' });
    }
  }
}
