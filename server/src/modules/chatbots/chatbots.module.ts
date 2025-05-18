import { Module } from '@nestjs/common';
import { chatbotsService } from './chatbots.service';
import { chatbotsController } from './chatbots.controller';
import { RelationalchatbotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalchatbotPersistenceModule],
  controllers: [chatbotsController],
  providers: [chatbotsService],
  exports: [chatbotsService, RelationalchatbotPersistenceModule],
})
export class ChatbotsModule {}
