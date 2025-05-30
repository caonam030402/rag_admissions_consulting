import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetChatbotHistoryDto {
  @ApiProperty({
    description: 'ID của người dùng đã đăng nhập',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.guestId)
  userId?: number;

  @ApiProperty({
    description: 'ID của người dùng khách (chưa đăng nhập)',
    example: 'guest-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.userId)
  guestId?: string;

  @ApiProperty({
    description: 'ID của cuộc trò chuyện',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiProperty({
    description: 'Số trang',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Số lượng tin nhắn tối đa muốn lấy',
    example: 50,
    default: 50,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
