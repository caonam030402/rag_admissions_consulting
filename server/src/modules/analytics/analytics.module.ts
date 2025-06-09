import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { SmartAnalyticsService } from './smart-analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEntity } from './infrastructure/persistence/relational/entities/analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEntity])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SmartAnalyticsService],
  exports: [AnalyticsService, SmartAnalyticsService, TypeOrmModule],
})
export class AnalyticsModule { }
