// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateHumanHandoffDto } from './create-human-handoff.dto';

export class UpdateHumanHandoffDto extends PartialType(CreateHumanHandoffDto) {}
