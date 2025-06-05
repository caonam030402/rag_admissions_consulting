import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigType } from 'src/common/enums/chatbot.enum';

export class FindChatbotConfigDto {
  @ApiProperty({
    enum: ConfigType,
    description: 'Config type filter',
    required: false,
  })
  @IsEnum(ConfigType)
  @IsOptional()
  type?: ConfigType;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Environment filter', required: false })
  @IsOptional()
  environment?: string;
}
