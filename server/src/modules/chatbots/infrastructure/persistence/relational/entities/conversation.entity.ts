import {
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ChatbotHistoryEntity } from './chatbot-history.entity';

@Entity({
  name: 'conversations',
})
export class ConversationEntity {
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
  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt?: Date | null;

  @ApiProperty()
  @OneToMany(() => ChatbotHistoryEntity, (message) => message.conversation)
  messages: ChatbotHistoryEntity[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
