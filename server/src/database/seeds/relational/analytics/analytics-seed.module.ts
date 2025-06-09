import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEntity } from '../../../../modules/analytics/infrastructure/persistence/relational/entities/analytics.entity';
import { AnalyticsSeedService } from './analytics-seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([AnalyticsEntity])],
    providers: [AnalyticsSeedService],
    exports: [AnalyticsSeedService],
})
export class AnalyticsSeedModule { } 