import { Module } from '@nestjs/common';
import { chatbotRepository } from '../chatbot.repository';
import { chatbotRelationalRepository } from './repositories/chatbot.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotHistoryEntity } from './entities/chatbot-history.entity';
import { ChatbotUserEntity } from './entities/chatbot-user.entity';
import { ChatBotEntity } from './entities/chatbot.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotHistoryEntity,
      ChatbotUserEntity,
      ChatBotEntity,
    ]),
  ],
  providers: [
    {
      provide: chatbotRepository,
      useClass: chatbotRelationalRepository,
    },
  ],
  exports: [chatbotRepository],
  
})
export class RelationalchatbotPersistenceModule {}
