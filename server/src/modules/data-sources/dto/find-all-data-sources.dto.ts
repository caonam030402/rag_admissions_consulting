import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllDataSourcesDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsIn(['Website', 'File', 'Manual', 'all'])
  source?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'processing', 'completed', 'failed', 'all'])
  status?: string;
}
