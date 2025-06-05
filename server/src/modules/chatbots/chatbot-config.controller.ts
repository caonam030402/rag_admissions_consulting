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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ChatbotConfigService } from './chatbot-config.service';
import { CreateChatbotConfigDto } from './dto/create-chatbot-config.dto';
import { UpdateChatbotConfigDto } from './dto/update-chatbot-config.dto';
import { FindChatbotConfigDto } from './dto/find-chatbot-config.dto';
import { ChatbotConfig } from './domain/chatbot-config';

@ApiTags('Chatbot Config')
@Controller({
  path: 'chatbot-config',
  version: '1',
})
export class ChatbotConfigController {
  constructor(private readonly configService: ChatbotConfigService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: ChatbotConfig })
  @ApiOperation({ summary: 'Create new chatbot configuration' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(
    @Body() createConfigDto: CreateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    return this.configService.create(createConfigDto);
  }

  @Get()
  @ApiOkResponse({ type: [ChatbotConfig] })
  @ApiOperation({ summary: 'Get all chatbot configurations with filters' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll(@Query() query: FindChatbotConfigDto): Promise<ChatbotConfig[]> {
    return this.configService.findAll(query);
  }

  @Get('active')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({
    summary: 'Get active merged configuration for RAG system',
    description:
      'Returns merged configuration (default + override) for RAG system to use',
  })
  getActiveConfig(): Promise<ChatbotConfig> {
    return this.configService.getActiveConfig();
  }

  @Get('initialize')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({ summary: 'Initialize default configuration if not exists' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  initializeDefault(): Promise<ChatbotConfig> {
    return this.configService.initializeDefaultConfig();
  }

  @Get(':id')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOperation({ summary: 'Get chatbot configuration by ID' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOne(@Param('id') id: string): Promise<ChatbotConfig> {
    return this.configService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateConfigDto: UpdateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    return this.configService.updateAndReload(id, updateConfigDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.configService.remove(id);
  }

  @Post('trigger-rag-reload')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiOperation({
    summary: 'Manually trigger RAG service to reload configuration',
    description:
      'Force Python RAG service to reload configuration from backend',
  })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async triggerRagReload() {
    try {
      // Use the private method through a public wrapper
      await (this.configService as any).triggerRagConfigReload();
      return {
        success: true,
        message: 'RAG service reload triggered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to trigger RAG reload: ${error.message}`,
      };
    }
  }

  // API dành cho Frontend - không cần authentication
  @Get('public/basic-info')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        personality: { type: 'object' },
        llmConfig: { type: 'object' },
      },
    },
  })
  @ApiOperation({
    summary: 'Get basic info configuration for frontend (public)',
    description: 'Returns personality and basic LLM config for frontend forms',
  })
  async getBasicInfo() {
    const config = await this.configService.getActiveConfig();
    return {
      personality: config.personality,
      llmConfig: {
        defaultModel: config.llmConfig.defaultModel,
        maxTokens: config.llmConfig.maxTokens,
        temperature: config.llmConfig.temperature,
      },
    };
  }

  @Get('public/appearance')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        appearance: { type: 'object' },
      },
    },
  })
  @ApiOperation({
    summary: 'Get appearance configuration for frontend (public)',
    description: 'Returns appearance settings for frontend styling',
  })
  async getAppearance() {
    const config = await this.configService.getActiveConfig();
    return {
      appearance: config.appearance,
    };
  }

  @Get('public/welcome-settings')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        welcomeSettings: { type: 'object' },
      },
    },
  })
  @ApiOperation({
    summary: 'Get welcome settings for frontend (public)',
    description: 'Returns welcome settings for chat initialization',
  })
  async getWelcomeSettings() {
    const config = await this.configService.getActiveConfig();
    return {
      welcomeSettings: config.welcomeSettings,
    };
  }

  @Get('public/human-handoff')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        humanHandoff: { type: 'object' },
      },
    },
  })
  @ApiOperation({
    summary: 'Get human handoff configuration for frontend (public)',
    description: 'Returns human handoff settings for chat escalation',
  })
  async getHumanHandoff() {
    const config = await this.configService.getActiveConfig();
    return {
      humanHandoff: config.humanHandoff,
    };
  }

  // API cho RAG system - lấy config đơn giản
  @Get('rag/config')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        llmConfig: {
          type: 'object',
          properties: {
            defaultModel: { type: 'string' },
            maxTokens: { type: 'number' },
            temperature: { type: 'number' },
          },
        },
        chatConfig: {
          type: 'object',
          properties: {
            maxContextLength: { type: 'number' },
            contextWindowMinutes: { type: 'number' },
            maxResponseTokens: { type: 'number' },
            streamDelayMs: { type: 'number' },
          },
        },
        personality: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            persona: { type: 'string' },
            personality: { type: 'string' },
            creativityLevel: { type: 'number' },
          },
        },
        contactInfo: {
          type: 'object',
          properties: {
            hotline: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            address: { type: 'string' },
          },
        },
        environment: { type: 'string' },
        debug: { type: 'boolean' },
      },
    },
  })
  @ApiOperation({
    summary: 'Get configuration for RAG system',
    description:
      'Returns essential configuration for RAG system operation - LLM, chat, personality, contact info',
  })
  async getRagConfig() {
    const config = await this.configService.getActiveConfig();

    return {
      llmConfig: {
        defaultModel: config.llmConfig.defaultModel,
        maxTokens: config.llmConfig.maxTokens,
        temperature: config.llmConfig.temperature,
      },
      chatConfig: {
        maxContextLength: config.chatConfig.maxContextLength,
        contextWindowMinutes: config.chatConfig.contextWindowMinutes,
        maxResponseTokens: config.chatConfig.maxResponseTokens,
        streamDelayMs: config.chatConfig.streamDelayMs,
      },
      personality: {
        name: config.personality.name,
        persona: config.personality.persona,
        personality: config.personality.personality,
        creativityLevel: config.personality.creativityLevel,
      },
      contactInfo: {
        hotline: config.contactInfo.hotline,
        email: config.contactInfo.email,
        website: config.contactInfo.website,
        address: config.contactInfo.address,
      },
      environment: config.environment,
      debug: config.debug,
    };
  }

  // API để update từng phần riêng biệt
  @Patch('section/basic-info')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({
    summary: 'Update only basic info section',
    description: 'Update personality and basic LLM settings',
  })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateBasicInfo(
    @Body()
    updateData: {
      personality?: Partial<CreateChatbotConfigDto['personality']>;
      llmConfig?: Partial<CreateChatbotConfigDto['llmConfig']>;
    },
  ): Promise<ChatbotConfig> {
    // Tìm hoặc tạo override config
    const configs = await this.configService.findAll({
      type: 'override' as any,
    });
    const overrideConfig = configs.find((c) => c.isActive);

    if (!overrideConfig) {
      // Tạo override config mới
      const activeConfig = await this.configService.getActiveConfig();
      const createDto: CreateChatbotConfigDto = {
        ...activeConfig,
        type: 'override' as any,
        personality: updateData.personality
          ? { ...activeConfig.personality, ...updateData.personality }
          : activeConfig.personality,
        llmConfig: updateData.llmConfig
          ? { ...activeConfig.llmConfig, ...updateData.llmConfig }
          : activeConfig.llmConfig,
      };
      return this.configService.createAndReload(createDto);
    } else {
      // Update existing override config
      const updateDto: UpdateChatbotConfigDto = {};
      if (updateData.personality)
        updateDto.personality = updateData.personality as any;
      if (updateData.llmConfig)
        updateDto.llmConfig = updateData.llmConfig as any;

      return this.configService.updateAndReload(overrideConfig.id, updateDto);
    }
  }

  @Patch('section/appearance')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({ summary: 'Update only appearance section' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateAppearance(
    @Body()
    updateData: {
      appearance?: Partial<CreateChatbotConfigDto['appearance']>;
    },
  ): Promise<ChatbotConfig> {
    const configs = await this.configService.findAll({
      type: 'override' as any,
    });
    const overrideConfig = configs.find((c) => c.isActive);

    if (!overrideConfig) {
      const activeConfig = await this.configService.getActiveConfig();
      const createDto: CreateChatbotConfigDto = {
        ...activeConfig,
        type: 'override' as any,
        appearance: updateData.appearance
          ? { ...activeConfig.appearance, ...updateData.appearance }
          : activeConfig.appearance,
      };
      return this.configService.createAndReload(createDto);
    } else {
      return this.configService.updateAndReload(overrideConfig.id, {
        appearance: updateData.appearance as any,
      });
    }
  }

  @Patch('section/welcome-settings')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({ summary: 'Update only welcome settings section' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateWelcomeSettings(
    @Body()
    updateData: {
      welcomeSettings?: Partial<CreateChatbotConfigDto['welcomeSettings']>;
    },
  ): Promise<ChatbotConfig> {
    const configs = await this.configService.findAll({
      type: 'override' as any,
    });
    const overrideConfig = configs.find((c) => c.isActive);

    if (!overrideConfig) {
      const activeConfig = await this.configService.getActiveConfig();
      const createDto: CreateChatbotConfigDto = {
        ...activeConfig,
        type: 'override' as any,
        welcomeSettings: updateData.welcomeSettings
          ? { ...activeConfig.welcomeSettings, ...updateData.welcomeSettings }
          : activeConfig.welcomeSettings,
      };
      return this.configService.createAndReload(createDto);
    } else {
      return this.configService.updateAndReload(overrideConfig.id, {
        welcomeSettings: updateData.welcomeSettings as any,
      });
    }
  }

  @Patch('section/human-handoff')
  @ApiOkResponse({ type: ChatbotConfig })
  @ApiOperation({ summary: 'Update only human handoff section' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateHumanHandoff(
    @Body()
    updateData: {
      humanHandoff?: Partial<CreateChatbotConfigDto['humanHandoff']>;
    },
  ): Promise<ChatbotConfig> {
    const configs = await this.configService.findAll({
      type: 'override' as any,
    });
    const overrideConfig = configs.find((c) => c.isActive);

    if (!overrideConfig) {
      const activeConfig = await this.configService.getActiveConfig();
      const createDto: CreateChatbotConfigDto = {
        ...activeConfig,
        type: 'override' as any,
        humanHandoff: updateData.humanHandoff
          ? { ...activeConfig.humanHandoff, ...updateData.humanHandoff }
          : activeConfig.humanHandoff,
      };
      return this.configService.createAndReload(createDto);
    } else {
      return this.configService.updateAndReload(overrideConfig.id, {
        humanHandoff: updateData.humanHandoff as any,
      });
    }
  }
}
