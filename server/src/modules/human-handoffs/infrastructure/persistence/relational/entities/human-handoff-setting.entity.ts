import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import type { WorkingDaysConfig } from '../../../../domain/human-handoff-setting';

@Entity({
  name: 'human_handoff_setting',
})
export class HumanHandoffSettingEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'Agent',
  })
  @Index()
  agentAlias: string;

  @Column({
    type: 'text',
    default: 'support,help,agent',
  })
  triggerPattern: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Asia/Ho_Chi_Minh',
  })
  timezone: string;

  @Column({
    type: 'json',
    default: () => '\'["monday","tuesday","wednesday","thursday","friday"]\'',
  })
  workingDays: string[];

  @Column({
    type: 'jsonb',
    default: () => "'{}'",
  })
  workingHours: WorkingDaysConfig;

  @Column({
    type: 'boolean',
    default: true,
  })
  isEnabled: boolean;

  @Column({
    type: 'integer',
    default: 60,
  })
  timeoutDuration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
