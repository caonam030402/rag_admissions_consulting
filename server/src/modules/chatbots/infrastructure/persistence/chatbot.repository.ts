import { IQueryOptions } from 'src/utils/types/query-options';
import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { ChatbotHistory } from '../../domain/chatbot-history';

export abstract class chatbotRepository {
  abstract findAllHistoryWithPagination({
    paginationOptions,
    queryOptions,
  }: {
    paginationOptions: IPaginationOptions;
    queryOptions: IQueryOptions;
  }): Promise<ChatbotHistory[]>;

  abstract removeHistory(id: ChatbotHistory['id']): Promise<void>;

  abstract createHistory(params: {
    userId?: number;
    guestId?: string;
    role: string;
    content: string;
    conversationId?: string;
    title?: string;
  }): Promise<ChatbotHistory>;

  abstract findConversationsByUser(params: {
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
  >;

  abstract findHistoryByConversation(
    conversationId: string,
    page?: number,
    limit?: number,
  ): Promise<ChatbotHistory[]>;

  abstract updateConversationTitle(
    conversationId: string,
    title: string,
  ): Promise<void>;
}
