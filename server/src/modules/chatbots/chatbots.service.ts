import { Injectable } from '@nestjs/common';
import { chatbotRepository } from './infrastructure/persistence/chatbot.repository';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ChatbotHistory } from './domain/chatbot-history';
import { IQueryOptions } from 'src/utils/types/query-options';
import { CreateChatbotHistoryDto } from './dto/create-chatbot-history.dto';
import { GetChatbotHistoryDto } from './dto/get-chatbot-history.dto';

@Injectable()
export class chatbotsService {
  constructor(private readonly chatbotRepository: chatbotRepository) { }

  findAllHistoryWithPagination({
    paginationOptions,
    queryOptions,
  }: {
    paginationOptions: IPaginationOptions;
    queryOptions: IQueryOptions;
  }) {
    return this.chatbotRepository.findAllHistoryWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      queryOptions,
    });
  }

  async removeHistory(id: ChatbotHistory['id']): Promise<void> {
    return this.chatbotRepository.removeHistory(id);
  }

  createHistory(dto: CreateChatbotHistoryDto) {
    return this.chatbotRepository.createHistory({
      userId: dto.userId,
      guestId: dto.guestId,
      role: dto.role,
      content: dto.content,
      conversationId: dto.conversationId,
      title: dto.title,
    });
  }

  findConversationsByUser(params: GetChatbotHistoryDto) {
    return this.chatbotRepository.findConversationsByUser({
      userId: params.userId,
      guestId: params.guestId,
      page: params.page,
      limit: params.limit,
    });
  }

  findHistoryByConversation(
    conversationId: string,
    page?: number,
    limit?: number,
  ) {
    return this.chatbotRepository.findHistoryByConversation(
      conversationId,
      page,
      limit,
    );
  }

  updateConversationTitle(conversationId: string, title: string) {
    return this.chatbotRepository.updateConversationTitle(
      conversationId,
      title,
    );
  }

  deleteConversation(conversationId: string) {
    return this.chatbotRepository.deleteConversation(conversationId);
  }

  async debugConversations(userId: number) {
    console.log('🔧 DEBUG: Querying conversations for userId:', userId);

    // Direct debug - let's see what's in the conversations table
    const allConversations = await this.chatbotRepository.findConversationsByUser({
      userId: userId,
      page: 1,
      limit: 100
    });

    console.log('🔧 DEBUG: Found conversations:', allConversations);
    return allConversations;
  }
}
