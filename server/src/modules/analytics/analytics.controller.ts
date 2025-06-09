import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AnalyticsService } from './analytics.service';
import { SmartAnalyticsService, SmartAnalyticsMetrics } from './smart-analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { FindAllAnalyticsDto } from './dto/find-all-analytics.dto';
import { Analytics } from './domain/analytics';
import { AnalyticsEventType } from './infrastructure/persistence/relational/entities/analytics.entity';

@ApiTags('Analytics & Monitoring')
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly smartAnalyticsService: SmartAnalyticsService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Analytics })
  @ApiOperation({ summary: 'Create analytics event' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createAnalyticsDto: CreateAnalyticsDto): Promise<Analytics> {
    return this.analyticsService.create(createAnalyticsDto);
  }

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiCreatedResponse({ type: Analytics })
  async trackEvent(@Body() eventData: {
    eventType: AnalyticsEventType;
    conversationId?: string;
    userId?: number;
    guestId?: string;
    sessionId?: string;
    messageContent?: string;
    metadata?: any;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Analytics> {
    return this.analyticsService.trackEvent(eventData);
  }

  @Get('conversation-analytics')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        totalConversations: { type: 'number' },
        avgConversationLength: { type: 'number' },
        avgResponseTime: { type: 'number' },
        conversationsByDay: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        messageDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get conversation analytics' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getConversationAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getConversationAnalytics(start, end);
  }

  @Get('most-asked-questions')
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          count: { type: 'number' },
          category: { type: 'string' },
          avgSatisfaction: { type: 'number' },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get most asked questions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getMostAskedQuestions(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.analyticsService.getMostAskedQuestions(limitNum);
  }

  @Get('user-satisfaction')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number' },
        totalRatings: { type: 'number' },
        ratingDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rating: { type: 'number' },
              count: { type: 'number' },
            },
          },
        },
        satisfactionTrend: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              avgRating: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get user satisfaction metrics' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getUserSatisfactionMetrics() {
    return this.analyticsService.getUserSatisfactionMetrics();
  }

  @Get('response-accuracy')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        averageAccuracy: { type: 'number' },
        totalResponses: { type: 'number' },
        accuracyTrend: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              avgAccuracy: { type: 'number' },
            },
          },
        },
        accuracyByCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              avgAccuracy: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get response accuracy tracking' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getResponseAccuracyMetrics() {
    return this.analyticsService.getResponseAccuracyMetrics();
  }

  @Get('ai-analytics')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        avgAccuracy: { type: 'number' },
        avgRelevance: { type: 'number' },
        avgHelpfulness: { type: 'number' },
        topCategories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'number' },
              avgAccuracy: { type: 'number' },
            },
          },
        },
        sentimentDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sentiment: { type: 'string' },
              count: { type: 'number' },
              percentage: { type: 'number' },
            },
          },
        },
        complexityDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              complexity: { type: 'string' },
              count: { type: 'number' },
              avgAccuracy: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get AI-powered analytics metrics' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getAIAnalyticsMetrics(): Promise<SmartAnalyticsMetrics> {
    return this.smartAnalyticsService.getSmartAnalyticsMetrics();
  }

  @Get()
  @ApiOkResponse({ type: [Analytics] })
  @ApiOperation({ summary: 'Get all analytics events with pagination' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll(@Query() query: FindAllAnalyticsDto): Promise<Analytics[]> {
    return this.analyticsService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: Analytics })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOperation({ summary: 'Get analytics event by ID' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(@Param('id') id: string): Promise<Analytics> {
    const result = await this.analyticsService.findOne(id);
    if (!result) {
      throw new NotFoundException('Analytics event not found');
    }
    return result;
  }

  @Patch(':id')
  @ApiOkResponse({ type: Analytics })
  @ApiOperation({ summary: 'Update analytics event' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateAnalyticsDto: UpdateAnalyticsDto,
  ): Promise<Analytics | null> {
    return this.analyticsService.update(id, updateAnalyticsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete analytics event' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.analyticsService.remove(id);
  }
}
