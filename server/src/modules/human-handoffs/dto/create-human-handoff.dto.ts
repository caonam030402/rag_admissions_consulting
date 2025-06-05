import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserProfileDto {
  @ApiProperty({
    type: String,
    description: 'User name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: String,
    description: 'User email',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateHumanHandoffDto {
  @ApiProperty({
    type: String,
    description: 'Conversation ID from chat system',
    example: 'conv-12345-67890',
  })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    type: Number,
    description: 'User ID if logged in',
    required: false,
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    type: String,
    description: 'Guest ID if not logged in',
    required: false,
    example: 'guest-12345-67890',
  })
  @IsOptional()
  @IsString()
  guestId?: string;

  @ApiProperty({
    type: String,
    description: 'Initial message that triggered the handoff',
    example: 'Chat ngay cán bộ tư vấn?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    type: UserProfileDto,
    description: 'User profile information',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserProfileDto)
  userProfile?: UserProfileDto;
}
