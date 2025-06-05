import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({
        description: 'Message content',
        example: 'Hello, how can I help you?',
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        description: 'Sender type: user or admin',
        example: 'admin',
        enum: ['user', 'admin'],
    })
    @IsString()
    @IsNotEmpty()
    senderType: 'user' | 'admin';

    @ApiProperty({
        description: 'Admin ID if sender is admin',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    adminId?: number;

    @ApiProperty({
        description: 'Admin name if sender is admin',
        example: 'John Doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    adminName?: string;
} 