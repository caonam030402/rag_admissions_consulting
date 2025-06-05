import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanHandoffsService } from './human-handoffs.service';
import { HumanHandoffsController } from './human-handoffs.controller';
import { HumanHandoffEntity } from './infrastructure/persistence/relational/entities/human-handoff.entity';
import { HumanHandoffsGateway } from './human-handoffs.gateway';
import { ChatbotsModule } from '../chatbots/chatbots.module';

@Module({
  imports: [TypeOrmModule.forFeature([HumanHandoffEntity]), ChatbotsModule],
  controllers: [HumanHandoffsController],
  providers: [HumanHandoffsService, HumanHandoffsGateway],
  exports: [HumanHandoffsService],
})
export class HumanHandoffsModule {}
