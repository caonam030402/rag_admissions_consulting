import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chatbotRepository } from '../../chatbot.repository';
import { IPaginationOptions } from '../../../../../../utils/types/pagination-options';
import { ChatbotHistoryEntity } from '../entities/chatbot-history.entity';
import { ChatbotHistoryMapper } from '../mappers/chatbot-history.mapper';
import { ChatbotHistory } from 'src/modules/chatbots/domain/chatbot-history';
import { IQueryOptions } from 'src/utils/types/query-options';
import { ChatbotUserEntity } from '../entities/chatbot-user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class chatbotRelationalRepository implements chatbotRepository {
  constructor(
    @InjectRepository(ChatbotHistoryEntity)
    private readonly chatbotRepository: Repository<ChatbotHistoryEntity>,
    @InjectRepository(ChatbotUserEntity)
    private readonly chatbotUserRepository: Repository<ChatbotUserEntity>,
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
        `message.${filterRelational.field} = :filterRelationalValue`,
        {
          filterRelationalValue: filterRelational.value,
        },
      );
    }

    if (filterBy && filterBy.field) {
      queryBuilder.andWhere(`message.${filterBy.field} = :filterByValue`, {
        filterByValue: filterBy.value,
      });
    }

    if (search && search.field) {
      queryBuilder.andWhere(`message.${search.field} LIKE :searchValue`, {
        searchValue: `%${search.value}%`,
      });
    }

    queryBuilder.orderBy(
      `message.${order.field ?? 'sentAt'}`,
      (order.direction?.toUpperCase() as 'ASC' | 'DESC') ?? 'ASC',
    );

    queryBuilder.leftJoinAndSelect('message.user', 'user');

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
    email: string;
    role: string;
    content: string;
    conversationId?: string;
  }): Promise<ChatbotHistory> {
    // Tìm hoặc tạo user dựa trên email
    let user = await this.chatbotUserRepository.findOne({
      where: { email: params.email },
    });

    if (!user) {
      user = this.chatbotUserRepository.create({
        email: params.email,
      });
      await this.chatbotUserRepository.save(user);
    }

    // Tạo conversation ID nếu chưa có
    const conversationId = params.conversationId || uuidv4();

    // Tạo bản ghi chatbot history
    const chatbotHistory = new ChatbotHistoryEntity();
    chatbotHistory.chatbotUser = user;
    chatbotHistory.chatbotUserId = user.id;
    chatbotHistory.role = params.role as any; // Chuyển đổi kiểu
    chatbotHistory.content = params.content;
    chatbotHistory.conversationId = conversationId;

    const savedHistory = await this.chatbotRepository.save(chatbotHistory);
    return ChatbotHistoryMapper.toDomain(savedHistory);
  }

  async removeHistory(id: ChatbotHistory['id']): Promise<void> {
    await this.chatbotRepository.delete(id);
  }
}
