import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ChatbotRole } from 'src/common/enums/chatbot.enum';

export class CreateChatbotHistoryDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com'
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role của người gửi tin nhắn',
    enum: ChatbotRole,
    example: ChatbotRole.USER
  })
  @IsEnum(ChatbotRole)
  @IsNotEmpty()
  role: ChatbotRole;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Tôi muốn hỏi về chương trình học'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID của cuộc trò chuyện',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;
} 