import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

import { HumanHandoffsService } from './human-handoffs.service';
import { CreateHumanHandoffDto } from './dto/create-human-handoff.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { HumanHandoff } from './domain/human-handoff';

@ApiTags('Human Handoff')
@Controller({
  path: 'human-handoff',
  version: '1',
})
export class HumanHandoffsController {
  constructor(private readonly humanHandoffsService: HumanHandoffsService) { }

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request human support' })
  @ApiCreatedResponse({ type: HumanHandoff })
  create(@Body() createHumanHandoffDto: CreateHumanHandoffDto) {
    return this.humanHandoffsService.create(createHumanHandoffDto);
  }

  @Get('status/:conversationId')
  @ApiOperation({ summary: 'Get handoff status for conversation' })
  @ApiParam({ name: 'conversationId', type: String })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        isWaiting: { type: 'boolean' },
        isConnected: { type: 'boolean' },
        adminName: { type: 'string', nullable: true },
        timeoutRemaining: { type: 'number', nullable: true },
      },
    },
  })
  getStatus(@Param('conversationId') conversationId: string) {
    return this.humanHandoffsService.getStatus(conversationId);
  }

  @Get('admin/notifications')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Get pending handoff notifications for admin' })
  @ApiOkResponse({
    type: [HumanHandoff],
    description: 'List of pending handoff requests',
  })
  getAdminNotifications() {
    return this.humanHandoffsService.getAdminNotifications();
  }

  @Post('admin/accept/:sessionId')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept handoff session' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiOkResponse({ type: HumanHandoff })
  acceptHandoff(
    @Param('sessionId') sessionId: string,
    @Request() request: any,
  ) {
    return this.humanHandoffsService.acceptHandoff(sessionId, request.user.id);
  }

  @Post('end/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End handoff session' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiOkResponse({ type: HumanHandoff })
  endHandoff(@Param('sessionId') sessionId: string) {
    return this.humanHandoffsService.endHandoff(sessionId);
  }

  @Get('admin/sessions')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Get all handoff sessions for admin' })
  @ApiOkResponse({
    type: [HumanHandoff],
    description: 'List of all handoff sessions',
  })
  getAdminSessions() {
    return this.humanHandoffsService.getAdminSessions();
  }

  @Post(':sessionId/message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message in handoff session' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.humanHandoffsService.sendMessage(sessionId, sendMessageDto);
  }

  @Post('conversation/:conversationId/message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send user message in active handoff session' })
  @ApiParam({ name: 'conversationId', type: String })
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  sendUserMessage(
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.humanHandoffsService.sendUserMessage(conversationId, sendMessageDto);
  }
}
