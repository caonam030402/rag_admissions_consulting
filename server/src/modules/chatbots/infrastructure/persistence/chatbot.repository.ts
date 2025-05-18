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
    email: string;
    role: string;
    content: string;
    conversationId?: string;
  }): Promise<ChatbotHistory>;
}
