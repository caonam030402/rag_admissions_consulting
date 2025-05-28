import { ApiProperty } from '@nestjs/swagger';
import { ChatbotRole } from 'src/common/enums/chatbot.enum';

export class ChatbotHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatbotUserId: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  role: ChatbotRole;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
