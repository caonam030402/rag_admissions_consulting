import { ApiProperty } from '@nestjs/swagger';

export class ConversationDto {
  @ApiProperty({
    description: 'ID của cuộc trò chuyện',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  conversationId: string;

  @ApiProperty({
    description: 'Tiêu đề cuộc trò chuyện',
    example: 'Hỏi về điều kiện đầu vào',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    description: 'Tin nhắn cuối cùng',
    example: 'Em muốn hỏi về điều kiện đầu vào đại học',
  })
  lastMessage: string;

  @ApiProperty({
    description: 'Thời gian tin nhắn cuối cùng',
    example: '2024-01-01T10:00:00Z',
  })
  lastMessageTime: Date;

  @ApiProperty({
    description: 'Số lượng tin nhắn trong cuộc trò chuyện',
    example: 5,
  })
  messageCount: number;
}
