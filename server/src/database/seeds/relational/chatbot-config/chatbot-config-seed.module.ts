import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotConfigEntity } from 'src/modules/chatbots/infrastructure/persistence/relational/entities/chatbot-config.entity';
import { ChatbotConfigSeedService } from './chatbot-config-seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([ChatbotConfigEntity])],
    providers: [ChatbotConfigSeedService],
    exports: [ChatbotConfigSeedService],
})
export class ChatbotConfigSeedModule { } 