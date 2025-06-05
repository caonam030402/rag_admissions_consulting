import { Module } from '@nestjs/common';
import { HumanHandoffRepository } from '../human-handoff.repository';
import { HumanHandoffRelationalRepository } from './repositories/human-handoff.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanHandoffEntity } from './entities/human-handoff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HumanHandoffEntity])],
  providers: [
    {
      provide: HumanHandoffRepository,
      useClass: HumanHandoffRelationalRepository,
    },
  ],
  exports: [HumanHandoffRepository],
})
export class RelationalHumanHandoffPersistenceModule {}
