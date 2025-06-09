import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import type { WorkingDaysConfig } from '../domain/human-handoff-setting';

export class CreateHumanHandoffSettingDto {
  @ApiProperty({
    description: 'Agent alias display name',
    example: 'Agent',
    required: false,
  })
  @IsString()
  @IsOptional()
  agentAlias?: string;

  @ApiProperty({
    description: 'Trigger pattern for human handoff (comma separated)',
    example: 'support,help,agent',
    required: false,
  })
  @IsString()
  @IsOptional()
  triggerPattern?: string;

  @ApiProperty({
    description: 'Timezone for working hours',
    example: 'Asia/Ho_Chi_Minh',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    type: Array,
    description: 'Working days of the week',
    example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    enum: [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ],
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  workingDays?: string[];

  @ApiProperty({
    type: 'object',
    description: 'Working hours configuration for each day',
    example: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  workingHours?: WorkingDaysConfig;

  @ApiProperty({
    description: 'Whether human handoff is enabled',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'Timeout duration in seconds',
    minimum: 30,
    maximum: 300,
    default: 60,
    required: false,
  })
  @IsNumber()
  @Min(30)
  @Max(300)
  @IsOptional()
  timeoutDuration?: number;
}
