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
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DataSource } from './domain/data-source';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../../utils/infinity-pagination';
import { FindAllDataSourcesDto } from './dto/find-all-data-sources.dto';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { Roles } from '../roles/roles.decorator';

@ApiTags('Datasources')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'data-sources',
  version: '1',
})
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  @ApiCreatedResponse({
    type: DataSource,
  })
  create(@Body() createDataSourceDto: CreateDataSourceDto) {
    return this.dataSourcesService.create(createDataSourceDto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'File để upload (PDF/CSV) - Optional nếu là website crawl',
        },
        type: {
          type: 'string',
          enum: ['website', 'pdf', 'csv', 'manual'],
          description: 'Loại data source',
        },
        name: {
          type: 'string',
          description: 'Tên data source',
        },
        description: {
          type: 'string',
          description: 'Mô tả data source',
        },
        url: {
          type: 'string',
          description: 'URL website (cho website crawl)',
        },
        title: {
          type: 'string',
          description: 'Tiêu đề (cho manual input)',
        },
        content: {
          type: 'string',
          description: 'Nội dung (cho manual input)',
        },
        uploaderEmail: {
          type: 'string',
          description: 'Email người upload',
        },
        uploadedBy: {
          type: 'string',
          description: 'ID người upload',
        },
        metadata: {
          type: 'object',
          description: 'Metadata bổ sung',
        },
      },
      required: ['type', 'name'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiCreatedResponse({
    type: DataSource,
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() request: any,
  ) {
    return await this.dataSourcesService.handleUniversalUpload(
      file,
      body,
      request.user,
    );
  }

  @Post(':id/process')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DataSource,
  })
  async processDataSource(@Param('id') id: string) {
    return this.dataSourcesService.processDataSource(id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(DataSource),
  })
  async findAll(
    @Query() query: FindAllDataSourcesDto,
  ): Promise<InfinityPaginationResponseDto<DataSource>> {
    console.log('🎯 Controller received query:', query);

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    console.log('🎯 Controller processed params:', {
      page,
      limit,
      search: query?.search,
      source: query?.source,
      status: query?.status,
    });

    const result = await this.dataSourcesService.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      searchOptions: {
        search: query?.search,
        source: query?.source,
        status: query?.status,
      },
    });

    console.log('🎯 Service result:', {
      dataLength: result.data.length,
      totalCount: result.totalCount,
    });

    const response = infinityPagination(result.data, { page, limit });

    console.log('🎯 Final response:', {
      dataLength: response.data.length,
      hasNextPage: response.hasNextPage,
    });

    return response;
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DataSource,
  })
  findOne(@Param('id') id: string) {
    return this.dataSourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DataSource,
  })
  update(
    @Param('id') id: string,
    @Body() updateDataSourceDto: UpdateDataSourceDto,
  ) {
    return this.dataSourcesService.update(id, updateDataSourceDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.dataSourcesService.remove(id);
  }
}
