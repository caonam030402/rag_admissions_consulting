import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityRelationalHelper } from '../../../utils/relational-entity-helper';

export interface WorkingHours {
  start: string; // HH:mm format
  end: string; // HH:mm format
  hours?: string; // calculated display value
}

export interface WorkingDaysConfig {
  sunday?: WorkingHours;
  monday?: WorkingHours;
  tuesday?: WorkingHours;
  wednesday?: WorkingHours;
  thursday?: WorkingHours;
  friday?: WorkingHours;
  saturday?: WorkingHours;
}

export class HumanHandoffSetting extends EntityRelationalHelper {
  @Allow()
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the settings',
  })
  id: string;

  @Allow()
  @ApiProperty({
    type: String,
    description: 'Agent alias display name',
    example: 'Agent',
  })
  agentAlias: string;

  @Allow()
  @ApiProperty({
    type: String,
    description: 'Trigger pattern for human handoff',
    example: 'support,help,agent',
  })
  triggerPattern: string;

  @Allow()
  @ApiProperty({
    type: String,
    description: 'Timezone for working hours',
    example: 'Asia/Ho_Chi_Minh',
  })
  timezone: string;

  @Allow()
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
  })
  workingDays: string[];

  @Allow()
  @ApiProperty({
    type: 'object',
    description: 'Working hours configuration for each day',
    example: {
      monday: { start: '09:00', end: '18:00', hours: '9 hrs' },
      tuesday: { start: '09:00', end: '18:00', hours: '9 hrs' },
    },
  })
  workingHours: WorkingDaysConfig;

  @Allow()
  @ApiProperty({
    type: Boolean,
    description: 'Whether human handoff is enabled',
    default: true,
  })
  isEnabled: boolean;

  @Allow()
  @ApiProperty({
    type: Number,
    description: 'Timeout duration in seconds',
    default: 60,
  })
  timeoutDuration: number;

  @Allow()
  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @Allow()
  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}
