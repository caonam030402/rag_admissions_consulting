import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsUrl,
  IsObject,
  IsNotEmpty,
} from 'class-validator';

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

export class CreateDataSourceDto {
  @ApiProperty({
    description: 'Tên nguồn dữ liệu',
    example: 'University of ABC Admissions Data',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mô tả nguồn dữ liệu',
    example: 'Dữ liệu tuyển sinh từ website chính thức',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Loại nguồn dữ liệu',
    enum: DataSourceType,
    example: DataSourceType.WEB_CRAWL,
  })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiProperty({
    description: 'URL nguồn (cho web crawl)',
    example: 'https://university.edu/admissions',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;

  @ApiProperty({
    description: 'Email của người upload',
    example: 'admin@company.com',
  })
  @IsEmail()
  uploaderEmail: string;

  @ApiProperty({
    description: 'ID của người upload',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  uploadedBy: string;

  @ApiProperty({
    description: 'Metadata bổ sung',
    example: { crawlDepth: 3, fileSize: '2MB' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
