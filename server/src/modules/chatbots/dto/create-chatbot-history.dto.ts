import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { ChatbotRole } from 'src/common/enums/chatbot.enum';

export class CreateChatbotHistoryDto {
  @ApiProperty({
    description: 'ID của người dùng đã đăng nhập',
    example: 1,
    required: false,
  })
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
    description: 'Role của người gửi tin nhắn',
    enum: ChatbotRole,
    example: ChatbotRole.USER,
  })
  @IsEnum(ChatbotRole)
  @IsNotEmpty()
  role: ChatbotRole;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Tôi muốn hỏi về chương trình học',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID của cuộc trò chuyện',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiProperty({
    description: 'Tiêu đề của cuộc trò chuyện',
    example: 'Hỏi về chương trình học',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
}
