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
  ) {}

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
    let user: UserEntity | null = null;

    // Nếu có userId, tìm user
    if (params.userId) {
      user = await this.userRepository.findOne({
        where: { id: params.userId },
      });
    }

    // Tạo conversation ID nếu chưa có
    const conversationId = params.conversationId || uuidv4();

    // Tìm hoặc tạo conversation
    let conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      // Tạo conversation mới
      conversation = new ConversationEntity();
      conversation.id = conversationId;
      conversation.user = user;
      conversation.userId = params.userId || null;
      conversation.guestId = params.guestId || null;
      conversation.title = params.title || null;
      conversation.isActive = true;
      conversation.lastMessageAt = new Date();

      await this.conversationRepository.save(conversation);
    } else {
      // Cập nhật lastMessageAt cho conversation hiện có
      conversation.lastMessageAt = new Date();
      if (params.title && !conversation.title) {
        conversation.title = params.title;
      }
      await this.conversationRepository.save(conversation);
    }

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

    const savedHistory = await this.chatbotRepository.save(chatbotHistory);
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
    const offset = (page - 1) * limit;

    const queryBuilder = this.conversationRepository.createQueryBuilder('conv');

    // Filter by user or guest
    if (params.userId) {
      queryBuilder.where('conv.userId = :userId', { userId: params.userId });
    } else if (params.guestId) {
      queryBuilder.where('conv.guestId = :guestId', {
        guestId: params.guestId,
      });
    } else {
      return [];
    }

    // Get conversations with pagination
    queryBuilder
      .andWhere('conv.isActive = :isActive', { isActive: true })
      .orderBy('conv.lastMessageAt', 'DESC')
      .offset(offset)
      .limit(limit);

    const conversations = await queryBuilder.getMany();

    // Get last message and message count for each conversation
    const result: Array<{
      conversationId: string;
      title: string | null;
      lastMessage: string;
      lastMessageTime: Date;
      messageCount: number;
    }> = [];

    for (const conv of conversations) {
      // Get last message
      const lastMessage = await this.chatbotRepository
        .createQueryBuilder('h')
        .select('h.content', 'content')
        .where('h.conversationId = :conversationId', {
          conversationId: conv.id,
        })
        .orderBy('h.createdAt', 'DESC')
        .limit(1)
        .getRawOne();

      // Get message count
      const messageCount = await this.chatbotRepository
        .createQueryBuilder('h')
        .where('h.conversationId = :conversationId', {
          conversationId: conv.id,
        })
        .getCount();

      result.push({
        conversationId: conv.id,
        title: conv.title ?? null,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: conv.lastMessageAt ?? conv.createdAt,
        messageCount,
      });
    }

    return result;
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

  async removeHistory(id: ChatbotHistory['id']): Promise<void> {
    await this.chatbotRepository.delete(id);
  }
}
