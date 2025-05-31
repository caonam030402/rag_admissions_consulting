import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chatbotRepository } from '../../chatbot.repository';
import { IPaginationOptions } from '../../../../../../utils/types/pagination-options';
import { ChatbotHistoryEntity } from '../entities/chatbot-history.entity';
import { ConversationEntity } from '../entities/conversation.entity';
import { ChatbotHistoryMapper } from '../mappers/chatbot-history.mapper';
import { ChatbotHistory } from 'src/modules/chatbots/domain/chatbot-history';
import { IQueryOptions } from 'src/utils/types/query-options';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class chatbotRelationalRepository implements chatbotRepository {
  constructor(
    @InjectRepository(ChatbotHistoryEntity)
    private readonly chatbotRepository: Repository<ChatbotHistoryEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  async findAllHistoryWithPagination({
    paginationOptions,
    queryOptions,
  }: {
    paginationOptions: IPaginationOptions;
    queryOptions: IQueryOptions;
  }): Promise<ChatbotHistory[]> {
    const { filterRelational, filterBy, search, order } = queryOptions;

    const queryBuilder = this.chatbotRepository.createQueryBuilder('chatbot');

    if (filterRelational && filterRelational.field) {
      queryBuilder.andWhere(
        `chatbot.${filterRelational.field} = :filterRelationalValue`,
        {
          filterRelationalValue: filterRelational.value,
        },
      );
    }

    if (filterBy && filterBy.field) {
      queryBuilder.andWhere(`chatbot.${filterBy.field} = :filterByValue`, {
        filterByValue: filterBy.value,
      });
    }

    if (search && search.field) {
      queryBuilder.andWhere(`chatbot.${search.field} LIKE :searchValue`, {
        searchValue: `%${search.value}%`,
      });
    }

    queryBuilder.orderBy(
      `chatbot.${order.field ?? 'createdAt'}`,
      (order.direction?.toUpperCase() as 'ASC' | 'DESC') ?? 'ASC',
    );

    queryBuilder.leftJoinAndSelect('chatbot.user', 'user');

    const totalMessages = await queryBuilder.getCount();

    const offset = Math.max(
      totalMessages - paginationOptions.page * paginationOptions.limit,
      0,
    );

    queryBuilder.skip(offset);
    queryBuilder.take(paginationOptions.limit);

    const entities = await queryBuilder.getMany();

    return entities.map((entity) => ChatbotHistoryMapper.toDomain(entity));
  }

  async createHistory(params: {
    userId?: number;
    guestId?: string;
    role: string;
    content: string;
    conversationId?: string;
    title?: string;
  }): Promise<ChatbotHistory> {
    console.log(
      '🔧 DEBUG createHistory params:',
      JSON.stringify(params, null, 2),
    );

    let user: UserEntity | null = null;

    // Nếu có userId, tìm user
    if (params.userId) {
      console.log(`🔧 DEBUG: Looking for user with ID: ${params.userId}`);
      user = await this.userRepository.findOne({
        where: { id: params.userId },
      });
      console.log(`🔧 DEBUG: Found user:`, user ? user.id : 'not found');
    }

    // Tạo conversation ID nếu chưa có
    const conversationId = params.conversationId || uuidv4();
    console.log(`🔧 DEBUG: Using conversation ID: ${conversationId}`);

    // Tìm hoặc tạo conversation
    let conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    console.log(
      '🔧 DEBUG: Existing conversation found:',
      conversation ? conversation.id : 'not found',
    );

    if (!conversation) {
      console.log('🔧 DEBUG: Creating new conversation...');
      // Tạo conversation mới
      conversation = new ConversationEntity();
      conversation.id = conversationId;
      conversation.user = user;
      conversation.userId = params.userId || null;
      conversation.guestId = params.guestId || null;
      conversation.title = params.title || null;
      conversation.isActive = true;
      conversation.lastMessageAt = new Date();

      console.log('🔧 DEBUG: New conversation entity:', {
        id: conversation.id,
        userId: conversation.userId,
        guestId: conversation.guestId,
        title: conversation.title,
        isActive: conversation.isActive
      });

      const savedConversation = await this.conversationRepository.save(conversation);
      console.log(
        '🔧 DEBUG: Conversation saved successfully:',
        savedConversation.id,
      );
      conversation = savedConversation;
    } else {
      console.log('🔧 DEBUG: Updating existing conversation lastMessageAt');
      // Cập nhật lastMessageAt cho conversation hiện có
      conversation.lastMessageAt = new Date();
      if (params.title && !conversation.title) {
        conversation.title = params.title;
      }
      await this.conversationRepository.save(conversation);
    }

    console.log('🔧 DEBUG: Creating chatbot history entry...');
    // Tạo bản ghi chatbot history
    const chatbotHistory = new ChatbotHistoryEntity();
    chatbotHistory.user = user;
    chatbotHistory.userId = params.userId || null;
    chatbotHistory.guestId = params.guestId || null;
    chatbotHistory.role = params.role as any;
    chatbotHistory.content = params.content;
    chatbotHistory.conversationId = conversationId;
    chatbotHistory.conversation = conversation;
    chatbotHistory.title = params.title || null;

    console.log('🔧 DEBUG: ChatbotHistory entity before save:', {
      userId: chatbotHistory.userId,
      guestId: chatbotHistory.guestId,
      role: chatbotHistory.role,
      conversationId: chatbotHistory.conversationId
    });

    const savedHistory = await this.chatbotRepository.save(chatbotHistory);
    console.log(
      '🔧 DEBUG: ChatbotHistory saved successfully:',
      savedHistory.id,
    );

    return ChatbotHistoryMapper.toDomain(savedHistory);
  }

  async findConversationsByUser(params: {
    userId?: number;
    guestId?: string;
    page?: number;
    limit?: number;
  }): Promise<
    Array<{
      conversationId: string;
      title: string | null;
      lastMessage: string;
      lastMessageTime: Date;
      messageCount: number;
    }>
  > {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    console.log('🔧 DEBUG findConversationsByUser params:', params);

    // Build where clause based on user type
    const whereConditions: any = {};
    if (params.userId) {
      whereConditions.userId = params.userId;
    } else if (params.guestId) {
      whereConditions.guestId = params.guestId;
    }

    console.log('🔧 DEBUG where conditions:', whereConditions);

    // Get conversations with proper TypeORM relations
    const conversations = await this.conversationRepository.find({
      where: whereConditions,
      order: {
        lastMessageAt: 'DESC',
      },
      skip,
      take: limit,
    });

    console.log('🔧 DEBUG found conversations count:', conversations.length);
    console.log('🔧 DEBUG conversations:', conversations.map(c => ({
      id: c.id,
      userId: c.userId,
      guestId: c.guestId,
      title: c.title,
      lastMessageAt: c.lastMessageAt
    })));

    // For each conversation, get the latest message and count
    const results = await Promise.all(
      conversations.map(async (conversation) => {
        // Get latest message
        const latestMessage = await this.chatbotRepository.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' },
        });

        // Get message count
        const messageCount = await this.chatbotRepository.count({
          where: { conversationId: conversation.id },
        });

        return {
          conversationId: conversation.id,
          title: conversation.title || null,
          lastMessage: latestMessage?.content || '',
          lastMessageTime: conversation.lastMessageAt || conversation.createdAt,
          messageCount,
        };
      }),
    );

    console.log('🔧 DEBUG final results count:', results.length);
    return results;
  }

  async findHistoryByConversation(
    conversationId: string,
    page?: number,
    limit?: number,
  ): Promise<ChatbotHistory[]> {
    const pageNumber = page || 1;
    const limitNumber = limit || 50;
    const offset = (pageNumber - 1) * limitNumber;

    const queryBuilder = this.chatbotRepository.createQueryBuilder('history');

    queryBuilder
      .where('history.conversationId = :conversationId', { conversationId })
      .orderBy('history.createdAt', 'ASC')
      .leftJoinAndSelect('history.user', 'user')
      .offset(offset)
      .limit(limitNumber);

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => ChatbotHistoryMapper.toDomain(entity));
  }

  async updateConversationTitle(
    conversationId: string,
    title: string,
  ): Promise<void> {
    await this.conversationRepository.update({ id: conversationId }, { title });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    // First delete all messages in the conversation
    await this.chatbotRepository.delete({ conversationId });

    // Then delete the conversation itself
    await this.conversationRepository.delete({ id: conversationId });
  }

  async removeHistory(id: ChatbotHistory['id']): Promise<void> {
    await this.chatbotRepository.delete(id);
  }
}
