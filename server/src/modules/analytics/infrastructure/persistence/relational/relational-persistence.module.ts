import { Module } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { AnalyticsRelationalRepository } from './repositories/analytics.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEntity } from './entities/analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEntity])],
  providers: [
    {
      provide: AnalyticsRepository,
      useClass: AnalyticsRelationalRepository,
    },
  ],
  exports: [AnalyticsRepository],
})
export class RelationalAnalyticsPersistenceModule {}
