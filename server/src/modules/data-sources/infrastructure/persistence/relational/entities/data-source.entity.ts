import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

export enum DataSourceType {
  WEB_CRAWL = 'web_crawl',
  FILE_UPLOAD = 'file_upload',
  API_IMPORT = 'api_import',
  MANUAL_INPUT = 'manual_input',
}

export enum DataSourceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity({
  name: 'data_source',
})
export class DataSourceEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 500 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: DataSourceType,
  })
  type: DataSourceType;

  @ApiProperty()
  @Column({ type: 'varchar', length: 2000, nullable: true })
  sourceUrl?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 1000, nullable: true })
  filePath?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: DataSourceStatus,
    default: DataSourceStatus.PENDING,
  })
  status: DataSourceStatus;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  documentsCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  vectorsCount: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  uploadedBy: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  uploaderEmail: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  processingStartedAt?: Date;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  processingCompletedAt?: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
