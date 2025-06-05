import { ApiProperty } from '@nestjs/swagger';

export class HumanHandoff {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Conversation ID from chat system',
  })
  conversationId: string;

  @ApiProperty({
    type: Number,
    description: 'User ID if logged in',
    required: false,
  })
  userId?: number;

  @ApiProperty({
    type: String,
    description: 'Guest ID if not logged in',
    required: false,
  })
  guestId?: string;

  @ApiProperty({
    type: Number,
    description: 'Admin ID who accepted the request',
    required: false,
  })
  adminId?: number;

  @ApiProperty({
    enum: ['waiting', 'connected', 'ended', 'timeout'],
    description: 'Current status of the handoff session',
  })
  status: 'waiting' | 'connected' | 'ended' | 'timeout';

  @ApiProperty({
    type: String,
    description: 'Initial message that triggered the handoff',
  })
  initialMessage: string;

  @ApiProperty({
    type: Object,
    description: 'User profile information',
    required: false,
  })
  userProfile?: {
    name?: string;
    email?: string;
  };

  @ApiProperty({
    type: Date,
    description: 'When the handoff was requested',
  })
  requestedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'When admin connected to the session',
    required: false,
  })
  connectedAt?: Date;

  @ApiProperty({
    type: Date,
    description: 'When the session ended',
    required: false,
  })
  endedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
