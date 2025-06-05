import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';
import { DataSourcesGateway } from './data-sources.gateway';
import { RelationalDataSourcePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalDataSourcePersistenceModule],
  controllers: [DataSourcesController],
  providers: [DataSourcesService, DataSourcesGateway],
  exports: [
    DataSourcesService,
    DataSourcesGateway,
    RelationalDataSourcePersistenceModule,
  ],
})
export class DataSourcesModule {}
