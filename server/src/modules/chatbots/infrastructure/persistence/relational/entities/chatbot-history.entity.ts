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
import { ChatbotUserEntity } from './chatbot-user.entity';

@Entity({
  name: 'chatbot_history',
})
export class ChatbotHistoryEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  chatbotUserId: string;

  @ApiProperty()
  @ManyToOne(() => ChatbotUserEntity)
  @JoinColumn({ name: 'chatbot_user_id' })
  chatbotUser: ChatbotUserEntity;

  @ApiProperty()
  @Column({ type: 'uuid' })
  conversationId: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: ChatbotRole })
  role: ChatbotRole;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
