import {
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChatbotRole } from 'src/common/enums/chatbot.enum';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity({
  name: 'chatbot_history',
})
export class ChatbotHistoryEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true })
  userId?: number | null;

  @ApiProperty()
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  guestId?: string | null;

  @ApiProperty()
  @Column({ type: 'uuid' })
  conversationId: string;

  @ApiProperty()
  @ManyToOne(
    () => ConversationEntity,
    (conversation) => conversation.messages,
    { nullable: true },
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation?: ConversationEntity | null;

  @ApiProperty()
  @Column({ type: 'enum', enum: ChatbotRole })
  role: ChatbotRole;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
