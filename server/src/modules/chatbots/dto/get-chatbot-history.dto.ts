import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class GetChatbotHistoryDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'ID của cuộc trò chuyện',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;
  
  @ApiProperty({
    description: 'Số lượng tin nhắn tối đa muốn lấy',
    example: 50,
    default: 50,
    required: false
  })
  @IsOptional()
  limit?: number;
} 