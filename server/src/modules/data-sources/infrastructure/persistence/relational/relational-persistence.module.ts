import { Module } from '@nestjs/common';
import { DataSourceRepository } from '../data-source.repository';
import { DataSourceRelationalRepository } from './repositories/data-source.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceEntity } from './entities/data-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity])],
  providers: [
    {
      provide: DataSourceRepository,
      useClass: DataSourceRelationalRepository,
    },
  ],
  exports: [DataSourceRepository],
})
export class RelationalDataSourcePersistenceModule {}
