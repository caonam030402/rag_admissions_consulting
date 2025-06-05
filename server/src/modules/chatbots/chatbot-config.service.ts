import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotConfigEntity } from './infrastructure/persistence/relational/entities/chatbot-config.entity';
import { CreateChatbotConfigDto } from './dto/create-chatbot-config.dto';
import { UpdateChatbotConfigDto } from './dto/update-chatbot-config.dto';
import { FindChatbotConfigDto } from './dto/find-chatbot-config.dto';
import { ChatbotConfig } from './domain/chatbot-config';
import { ChatbotConfigMapper } from './infrastructure/persistence/relational/mappers/chatbot-config.mapper';
import {
  ConfigType,
  ModelType,
  PersonalityType,
} from 'src/common/enums/chatbot.enum';

@Injectable()
export class ChatbotConfigService {
  private readonly RAG_SERVICE_URL =
    process.env.RAG_SERVICE_URL || 'http://localhost:8000';

  constructor(
    @InjectRepository(ChatbotConfigEntity)
    private readonly configRepository: Repository<ChatbotConfigEntity>,
  ) {}

  /**
   * Default config - tương tự Python RAG config
   */
  private getDefaultConfig(): Partial<CreateChatbotConfigDto> {
    return {
      type: ConfigType.DEFAULT,
      llmConfig: {
        defaultModel: ModelType.GEMINI_PRO,
        maxTokens: 2048,
        temperature: 0.7,
      },
      chatConfig: {
        maxContextLength: 20,
        contextWindowMinutes: 30,
        maxResponseTokens: 1024,
        streamDelayMs: 50,
      },
      personality: {
        name: 'Ned',
        persona: 'I am a helpful assistant for admissions consulting.',
        personality: PersonalityType.PROFESSIONAL,
        creativityLevel: 0.2,
      },
      appearance: {
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        chatBubbleStyle: 'rounded',
        fontFamily: 'Inter',
        fontSize: 14,
        darkMode: false,
        showAvatar: true,
        windowPosition: 'bottom-right',
      },
      welcomeSettings: {
        welcomeMessage:
          'Hello! I am here to help you with your admissions questions. How can I assist you today?',
        showWelcomeMessage: true,
        autoGreet: true,
        greetingDelay: 2,
        showSuggestedQuestions: true,
        suggestedQuestions: [
          'What are the admission requirements?',
          'How do I apply for a scholarship?',
          'What documents do I need?',
          'When is the application deadline?',
        ],
      },
      humanHandoff: {
        enabled: false,
        maxWaitTime: 30,
        showEscalationButton: true,
        escalationButtonText: 'Talk to human agent',
      },
      contactInfo: {
        hotline: '0236.3.650.403',
        email: 'tuyensinh@donga.edu.vn',
        website: 'https://donga.edu.vn',
        address: '33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng',
      },
      environment: 'development',
      debug: false,
      isActive: true,
    };
  }

  /**
   * Merge default config với override config
   */
  private mergeConfigs(defaultConfig: any, overrideConfig?: any): any {
    if (!overrideConfig) return defaultConfig;

    const merged = { ...defaultConfig };

    // Deep merge các nested objects
    Object.keys(overrideConfig).forEach((key) => {
      if (
        overrideConfig[key] &&
        typeof overrideConfig[key] === 'object' &&
        !Array.isArray(overrideConfig[key])
      ) {
        merged[key] = { ...merged[key], ...overrideConfig[key] };
      } else if (overrideConfig[key] !== undefined) {
        merged[key] = overrideConfig[key];
      }
    });

    return merged;
  }

  /**
   * Tạo config mới
   */
  async create(
    createConfigDto: CreateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    // Nếu tạo default config, merge với default values
    let configData = createConfigDto;
    if (createConfigDto.type === ConfigType.DEFAULT) {
      const defaultConfig = this.getDefaultConfig();
      configData = this.mergeConfigs(
        defaultConfig,
        createConfigDto,
      ) as CreateChatbotConfigDto;
    }

    const configEntity = this.configRepository.create(configData);
    const savedEntity = await this.configRepository.save(configEntity);

    return ChatbotConfigMapper.toDomain(savedEntity);
  }

  /**
   * Lấy tất cả configs với filter
   */
  async findAll(query: FindChatbotConfigDto): Promise<ChatbotConfig[]> {
    const queryBuilder = this.configRepository.createQueryBuilder('config');

    if (query.type) {
      queryBuilder.andWhere('config.type = :type', { type: query.type });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('config.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.environment) {
      queryBuilder.andWhere('config.environment = :environment', {
        environment: query.environment,
      });
    }

    queryBuilder.orderBy('config.createdAt', 'DESC');

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => ChatbotConfigMapper.toDomain(entity));
  }

  /**
   * Lấy config hợp lệ cho RAG system (merged config)
   */
  async getActiveConfig(): Promise<ChatbotConfig> {
    // Lấy default config
    const defaultConfigEntity = await this.configRepository.findOne({
      where: {
        type: ConfigType.DEFAULT,
        isActive: true,
      },
    });

    // Lấy override config (nếu có)
    const overrideConfigEntity = await this.configRepository.findOne({
      where: {
        type: ConfigType.OVERRIDE,
        isActive: true,
      },
      order: { updatedAt: 'DESC' }, // Lấy override mới nhất
    });

    let defaultConfig = this.getDefaultConfig();

    // Nếu có default config trong DB, sử dụng nó
    if (defaultConfigEntity) {
      defaultConfig = ChatbotConfigMapper.toDomain(defaultConfigEntity);
    }

    // Merge với override config nếu có
    if (overrideConfigEntity) {
      const overrideConfig = ChatbotConfigMapper.toDomain(overrideConfigEntity);
      const mergedConfig = this.mergeConfigs(defaultConfig, overrideConfig);

      // Create new config object with merged data
      const finalConfig = new ChatbotConfig();
      Object.assign(finalConfig, mergedConfig);
      finalConfig.id = overrideConfigEntity.id;
      finalConfig.type = ConfigType.OVERRIDE;

      return finalConfig;
    }

    return defaultConfig as ChatbotConfig;
  }

  /**
   * Lấy config theo ID
   */
  async findOne(id: string): Promise<ChatbotConfig> {
    const configEntity = await this.configRepository.findOne({
      where: { id },
    });

    if (!configEntity) {
      throw new NotFoundException('Config not found');
    }

    return ChatbotConfigMapper.toDomain(configEntity);
  }

  /**
   * Update config (chỉ có thể update override config)
   */
  async update(
    id: string,
    updateConfigDto: UpdateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { id },
    });

    if (!existingConfig) {
      throw new NotFoundException('Config not found');
    }

    // Merge update data với existing config
    const updatedData = this.mergeConfigs(existingConfig, updateConfigDto);

    await this.configRepository.update(id, updatedData);

    const updatedEntity = await this.configRepository.findOne({
      where: { id },
    });

    return ChatbotConfigMapper.toDomain(updatedEntity!);
  }

  /**
   * Xóa config
   */
  async remove(id: string): Promise<void> {
    const result = await this.configRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Config not found');
    }
  }

  /**
   * Khởi tạo default config nếu chưa có
   */
  async initializeDefaultConfig(): Promise<ChatbotConfig> {
    const existingDefault = await this.configRepository.findOne({
      where: { type: ConfigType.DEFAULT },
    });

    if (existingDefault) {
      return ChatbotConfigMapper.toDomain(existingDefault);
    }

    // Tạo default config
    const defaultConfig = this.getDefaultConfig();
    const configEntity = this.configRepository.create(defaultConfig);
    const savedEntity = await this.configRepository.save(configEntity);

    return ChatbotConfigMapper.toDomain(savedEntity);
  }

  /**
   * Trigger Python RAG service to reload configuration
   */
  private async triggerRagConfigReload(): Promise<void> {
    try {
      const response = await fetch(
        `${this.RAG_SERVICE_URL}/api/v1/reload-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ RAG service config reloaded successfully:', result);
      } else {
        console.error(
          '❌ Failed to reload RAG service config:',
          response.statusText,
        );
      }
    } catch (error) {
      console.error('❌ Error triggering RAG config reload:', error);
    }
  }

  /**
   * Update config and trigger RAG reload
   */
  async updateAndReload(
    id: string,
    updateConfigDto: UpdateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    const updatedConfig = await this.update(id, updateConfigDto);

    // Trigger RAG service reload in background
    this.triggerRagConfigReload().catch((error) =>
      console.error('Background RAG reload failed:', error),
    );

    return updatedConfig;
  }

  /**
   * Create config and trigger RAG reload
   */
  async createAndReload(
    createConfigDto: CreateChatbotConfigDto,
  ): Promise<ChatbotConfig> {
    const createdConfig = await this.create(createConfigDto);

    // Trigger RAG service reload in background
    this.triggerRagConfigReload().catch((error) =>
      console.error('Background RAG reload failed:', error),
    );

    return createdConfig;
  }

  /**
   * Public method to trigger RAG config reload
   */
  async triggerConfigReload(): Promise<void> {
    return this.triggerRagConfigReload();
  }
}
