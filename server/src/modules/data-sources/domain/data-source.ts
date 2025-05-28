import { ApiProperty } from '@nestjs/swagger';

export class DataSource {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  sourceUrl?: string;

  @ApiProperty()
  filePath?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  documentsCount: number;

  @ApiProperty()
  vectorsCount: number;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  uploaderEmail: string;

  @ApiProperty()
  processingStartedAt?: Date;

  @ApiProperty()
  processingCompletedAt?: Date;

  @ApiProperty()
  errorMessage?: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
