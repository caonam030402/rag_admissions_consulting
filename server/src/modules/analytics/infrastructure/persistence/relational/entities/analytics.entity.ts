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

export enum AnalyticsEventType {
  CONVERSATION_STARTED = 'conversation_started',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  HUMAN_HANDOFF_REQUESTED = 'human_handoff_requested',
  HUMAN_HANDOFF_CONNECTED = 'human_handoff_connected',
  CONVERSATION_ENDED = 'conversation_ended',
  USER_FEEDBACK = 'user_feedback',
  RESPONSE_GENERATED = 'response_generated',
  DOCUMENT_RETRIEVED = 'document_retrieved',
  ERROR_OCCURRED = 'error_occurred',
  AI_EVALUATION = 'ai_evaluation',
}

@Entity({
  name: 'analytics',
})
export class AnalyticsEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: AnalyticsEventType })
  @Index()
  eventType: AnalyticsEventType;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  @Index()
  conversationId?: string;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true })
  @Index()
  userId?: number;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  @Index()
  guestId?: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  sessionId?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  messageContent?: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    messageLength?: number;
    responseTime?: number;
    confidence?: number;
    retrievedDocs?: number;
    userRating?: number; // 1-5 stars
    errorType?: string;
    topic?: string;
    intent?: string;
    questionCategory?: string;
    satisfactionScore?: number;
    accuracy?: number;
    [key: string]: any;
  };

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  userAgent?: string;

  @ApiProperty()
  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  @Index()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
