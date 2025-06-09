import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { chatbotsService } from './chatbots.service';
import { chatbotsController } from './chatbots.controller';
import { ChatbotConfigController } from './chatbot-config.controller';
import { ChatbotConfigService } from './chatbot-config.service';
import { ChatbotConfigEntity } from './infrastructure/persistence/relational/entities/chatbot-config.entity';
import { RelationalchatbotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    RelationalchatbotPersistenceModule,
    TypeOrmModule.forFeature([ChatbotConfigEntity]),
    AnalyticsModule,
  ],
  controllers: [chatbotsController, ChatbotConfigController],
  providers: [chatbotsService, ChatbotConfigService],
  exports: [
    chatbotsService,
    ChatbotConfigService,
    RelationalchatbotPersistenceModule,
  ],
})
export class ChatbotsModule { }
