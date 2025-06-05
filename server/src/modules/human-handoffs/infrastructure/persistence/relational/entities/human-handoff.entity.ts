import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'human_handoff',
})
export class HumanHandoffEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  conversationId: string;

  @Column({ type: 'integer', nullable: true })
  @Index()
  userId?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  guestId?: string;

  @Column({ type: 'integer', nullable: true })
  @Index()
  adminId?: number;

  @Column({
    type: 'enum',
    enum: ['waiting', 'connected', 'ended', 'timeout'],
    default: 'waiting',
  })
  @Index()
  status: 'waiting' | 'connected' | 'ended' | 'timeout';

  @Column({ type: 'text' })
  initialMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  userProfile?: {
    name?: string;
    email?: string;
  };

  @Column({ type: 'timestamp with time zone' })
  @Index()
  requestedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  connectedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
