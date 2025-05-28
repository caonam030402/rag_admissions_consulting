import {
  Controller,
  Param,
  Delete,
  Query,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { chatbotsService } from './chatbots.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../../utils/infinity-pagination';
import { FindChatbotHistoryDto } from './dto/find-chatbot-history.dto';
import { ChatbotHistory } from './domain/chatbot-history';
import { CreateChatbotHistoryDto } from './dto/create-chatbot-history.dto';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Chatbots')
@Controller({
  path: 'chatbots',
  version: '1',
})
export class chatbotsController {
  constructor(private readonly chatbotsService: chatbotsService) {}

  @Get('history')
  @ApiOkResponse({ type: InfinityPaginationResponse(ChatbotHistory) })
  async findAllHistory(
    @Query() query: FindChatbotHistoryDto,
  ): Promise<InfinityPaginationResponseDto<ChatbotHistory>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const queryOptions = {
      filterRelational: {
        field: query.filterRelationalField,
        value: query.filterRelationalValue,
      },
      filterBy: {
        field: query.filterByField,
        value: query.filterByValue,
      },
      order: {
        field: query.orderField,
        direction: query.orderDirection,
      },
      search: {
        field: query.searchField,
        value: query.searchValue,
      },
    } as const;

    return infinityPagination(
      await this.chatbotsService.findAllHistoryWithPagination({
        queryOptions: queryOptions,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Post('history')
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiCreatedResponse({
    description: 'Message saved successfully',
    type: ChatbotHistory,
  })
  @Public() // Không yêu cầu xác thực để API có thể được gọi từ Python
  async createHistory(
    @Body() createChatbotHistoryDto: CreateChatbotHistoryDto,
  ): Promise<ChatbotHistory> {
    return this.chatbotsService.createHistory(createChatbotHistoryDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.chatbotsService.removeHistory(id);
  }
}
