import { ApiProperty } from '@nestjs/swagger';

export class Conversation {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId?: number | null;

  @ApiProperty()
  guestId?: string | null;

  @ApiProperty()
  title?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastMessageAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
