import { Module } from '@nestjs/common';
import { chatbotRepository } from '../chatbot.repository';
import { chatbotRelationalRepository } from './repositories/chatbot.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotHistoryEntity } from './entities/chatbot-history.entity';
import { ConversationEntity } from './entities/conversation.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ChatBotEntity } from './entities/chatbot.entity';
import { ChatbotConfigEntity } from './entities/chatbot-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotHistoryEntity,
      ConversationEntity,
      UserEntity,
      ChatBotEntity,
      ChatbotConfigEntity,
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
export class RelationalchatbotPersistenceModule { }
