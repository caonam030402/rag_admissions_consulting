import { ApiProperty } from '@nestjs/swagger';
import { ChatbotRole } from 'src/common/enums/chatbot.enum';

export class ChatbotHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId?: number | null;

  @ApiProperty()
  guestId?: string | null;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  role: ChatbotRole;

  @ApiProperty()
  content: string;

  @ApiProperty()
  title?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
