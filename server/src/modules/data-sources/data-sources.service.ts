import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  CreateDataSourceDto,
  DataSourceType,
  DataSourceStatus,
} from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DataSourceRepository } from './infrastructure/persistence/data-source.repository';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DataSource } from './domain/data-source';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DataSourcesGateway } from './data-sources.gateway';

const execAsync = promisify(exec);

@Injectable()
export class DataSourcesService {
  private readonly logger = new Logger(DataSourcesService.name);

  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly dataSourcesGateway: DataSourcesGateway,
  ) { }

  create(createDataSourceDto: CreateDataSourceDto) {
    const dataSource = this.createDataSourceFromDto(createDataSourceDto);
    return this.dataSourceRepository.create(dataSource);
  }

  private createDataSourceFromDto(
    dto: CreateDataSourceDto,
  ): Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      sourceUrl: dto.sourceUrl,
      uploaderEmail: dto.uploaderEmail || '',
      uploadedBy: dto.uploadedBy || '',
      metadata: dto.metadata,
      status: DataSourceStatus.PENDING,
      documentsCount: 0,
      vectorsCount: 0,
      filePath: undefined,
      processingStartedAt: undefined,
      processingCompletedAt: undefined,
      errorMessage: undefined,
    };
  }

  async handleUniversalUpload(
    file: Express.Multer.File,
    body: any,
    user: any,
  ): Promise<DataSource> {
    const { type, name, description, url, title, content, metadata } = body;

    if (!type || !name) {
      throw new BadRequestException('Type and name are required');
    }

    let dataSourceType: DataSourceType;
    let sourceUrl: string | undefined;
    let filePath: string | undefined;
    let processingInput: string;
    let processingType: 'crawl' | 'file' | 'manual';

    switch (type) {
      case 'website':
        if (!url) {
          throw new BadRequestException('URL is required for website crawl');
        }
        dataSourceType = DataSourceType.WEB_CRAWL;
        sourceUrl = url;
        processingInput = url;
        processingType = 'crawl';
        break;

      case 'pdf':
      case 'csv':
        if (!file) {
          throw new BadRequestException('File is required for file upload');
        }
        dataSourceType = DataSourceType.FILE_UPLOAD;
        filePath = this.saveUploadedFile(file);
        processingInput = path.join(process.cwd(), 'uploads', filePath);
        processingType = 'file';
        break;

      case 'manual':
        if (!title || !content) {
          throw new BadRequestException(
            'Title and content are required for manual input',
          );
        }
        dataSourceType = DataSourceType.MANUAL_INPUT;
        processingInput = JSON.stringify({ title, content });
        console.log('Manual input - Original title:', title);
        console.log('Manual input - Original content:', content);
        console.log('Manual input - JSON string:', processingInput);
        processingType = 'manual';
        break;

      default:
        throw new BadRequestException(
          'Invalid type. Must be: website, pdf, csv, or manual',
        );
    }

    // Create data source record
    const createDto: CreateDataSourceDto = {
      name,
      description: description || `${type} data source: ${name}`,
      type: dataSourceType,
      sourceUrl,
      uploaderEmail: body.uploaderEmail || user?.email || '',
      uploadedBy: body.uploadedBy || user?.id || '',
      metadata: {
        ...metadata,
        sourceType: type,
        uploadedAt: new Date().toISOString(),
        ...(file && {
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        }),
        ...(type === 'manual' && { title, content }),
      },
    };

    const dataSourceData = this.createDataSourceFromDto(createDto);
    const dataSource = await this.dataSourceRepository.create(dataSourceData);

    if (!dataSource) {
      throw new BadRequestException('Failed to create data source');
    }

    // Update with file path if applicable
    if (filePath) {
      const updatedDataSource = await this.dataSourceRepository.update(
        dataSource.id,
        {
          filePath,
          status: DataSourceStatus.PENDING,
        },
      );

      if (!updatedDataSource) {
        throw new BadRequestException('Failed to update data source');
      }

      // Trigger Python processing
      void this.triggerPythonProcessing(
        updatedDataSource.id,
        processingType,
        processingInput,
      );

      return updatedDataSource;
    } else {
      // For non-file uploads, update status and trigger processing
      const updatedDataSource = await this.dataSourceRepository.update(
        dataSource.id,
        {
          status: DataSourceStatus.PROCESSING,
          processingStartedAt: new Date(),
        },
      );

      if (!updatedDataSource) {
        throw new BadRequestException('Failed to update data source');
      }

      // Trigger Python processing
      void this.triggerPythonProcessing(
        updatedDataSource.id,
        processingType,
        processingInput,
      );

      return updatedDataSource;
    }
  }

  private saveUploadedFile(file: Express.Multer.File): string {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!['.pdf', '.csv'].includes(fileExtension)) {
      throw new BadRequestException(
        'Unsupported file type. Only PDF and CSV files are allowed.',
      );
    }

    // Save file to storage
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return fileName;
  }

  async processDataSource(id: string): Promise<DataSource> {
    const dataSource = await this.dataSourceRepository.findById(id);
    if (!dataSource) {
      throw new BadRequestException('Data source not found');
    }

    // Update status to processing
    const updatedDataSource = await this.dataSourceRepository.update(id, {
      status: DataSourceStatus.PROCESSING,
      processingStartedAt: new Date(),
    });

    if (!updatedDataSource) {
      throw new BadRequestException('Failed to update data source');
    }

    // Determine processing type and trigger appropriate Python script
    if (dataSource.type === DataSourceType.WEB_CRAWL && dataSource.sourceUrl) {
      void this.triggerPythonProcessing(id, 'crawl', dataSource.sourceUrl);
    } else if (
      dataSource.type === DataSourceType.FILE_UPLOAD &&
      dataSource.filePath
    ) {
      const fullFilePath = path.join(
        process.cwd(),
        'uploads',
        dataSource.filePath,
      );
      void this.triggerPythonProcessing(id, 'file', fullFilePath);
    }

    return updatedDataSource;
  }

  private async triggerPythonProcessing(
    dataSourceId: string,
    type: 'crawl' | 'file' | 'manual',
    input: string,
  ): Promise<void> {
    try {
      // Emit initial processing start
      this.dataSourcesGateway.emitProcessingLog({
        dataSourceId,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `🚀 Starting ${type} processing...`,
        step: 'initialize',
        progress: 0,
      });

      const pythonScriptPath = path.join(
        process.cwd(),
        '..',
        'rag_admissions_consulting',
        'src',
      );

      // Map types to pipeline types
      let pipelineType: string;
      if (type === 'crawl') {
        pipelineType = 'website';
      } else if (type === 'file') {
        // Determine if it's PDF or CSV from file extension
        const fileExtension = path.extname(input).toLowerCase();
        pipelineType = fileExtension === '.pdf' ? 'pdf' : 'csv';
      } else {
        pipelineType = 'manual';
      }

      // Emit pipeline type determined
      this.dataSourcesGateway.emitProcessingLog({
        dataSourceId,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `📋 Pipeline type: ${pipelineType}`,
        step: 'prepare',
        progress: 10,
      });

      // Use the unified pipeline runner
      const command = `cd "${pythonScriptPath}" && python scripts/run_data_pipeline.py "${dataSourceId}" "${pipelineType}" "${input}"`;

      // Emit command execution
      this.dataSourcesGateway.emitProcessingLog({
        dataSourceId,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `⚡ Executing Python pipeline...`,
        step: 'execute',
        progress: 20,
      });

      // Execute Python script asynchronously
      execAsync(command)
        .then(async ({ stdout, stderr }) => {
          // Check if stderr contains actual errors (not just info logs)
          const hasError =
            stderr &&
            (stderr.toLowerCase().includes('error') ||
              stderr.toLowerCase().includes('failed') ||
              stderr.toLowerCase().includes('exception') ||
              stderr.toLowerCase().includes('traceback'));

          if (hasError) {
            console.error('Python script stderr:', stderr);

            // Emit error log
            this.dataSourcesGateway.emitProcessingLog({
              dataSourceId,
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `❌ Processing failed: ${stderr}`,
              step: 'error',
              progress: 100,
            });

            this.dataSourcesGateway.emitProcessingError(dataSourceId, stderr);

            await this.updateProcessingStatus(
              dataSourceId,
              DataSourceStatus.FAILED,
              stderr,
            );
          } else {
            // Process stdout for success/failure determination
            console.log('Python script stdout:', stdout);

            if (stderr) {
              console.log('Python script stderr (info logs):', stderr);
            }

            // Emit processing steps based on stdout
            const lines = stdout.split('\n').filter((line) => line.trim());
            let progress = 30;

            for (const line of lines) {
              if (line.includes('Processing')) {
                this.dataSourcesGateway.emitProcessingLog({
                  dataSourceId,
                  timestamp: new Date().toISOString(),
                  level: 'info',
                  message: `🔄 ${line}`,
                  step: 'processing',
                  progress: Math.min(progress, 70),
                });
                progress += 10;
              } else if (line.includes('Uploaded')) {
                this.dataSourcesGateway.emitProcessingLog({
                  dataSourceId,
                  timestamp: new Date().toISOString(),
                  level: 'info',
                  message: `📤 ${line}`,
                  step: 'upload',
                  progress: 90,
                });
              } else if (line.includes('SUCCESS')) {
                this.dataSourcesGateway.emitProcessingLog({
                  dataSourceId,
                  timestamp: new Date().toISOString(),
                  level: 'success',
                  message: `✅ ${line}`,
                  step: 'complete',
                  progress: 100,
                });
              }
            }

            // Parse success output to extract metrics
            const successMatch = stdout.match(
              /SUCCESS: (?:Pipeline completed|Uploaded (\d+) documents? and (\d+) vectors|Processed (\d+) documents?)/,
            );

            if (successMatch) {
              // Extract document and vector counts from different output formats
              let documentsCount = 0;
              let vectorsCount = 0;

              // Try to extract from "Uploaded X documents and Y vectors" format
              const uploadMatch = stdout.match(
                /Uploaded (\d+) documents? and (\d+) vectors/,
              );

              if (uploadMatch) {
                documentsCount = parseInt(uploadMatch[1]);
                vectorsCount = parseInt(uploadMatch[2]);
              } else {
                // Try to extract from "Processed X documents" format
                const processedMatch = stdout.match(
                  /Processed (\d+) documents?/,
                );
                if (processedMatch) {
                  documentsCount = parseInt(processedMatch[1]);
                }

                // Try to extract vectors count separately
                const vectorMatch = stdout.match(/(\d+) vectors/);
                if (vectorMatch) {
                  vectorsCount = parseInt(vectorMatch[1]);
                }
              }

              const updateData: UpdateDataSourceDto = {
                status: DataSourceStatus.COMPLETED,
                processingCompletedAt: new Date(),
                documentsCount,
                vectorsCount,
              };

              await this.dataSourceRepository.update(dataSourceId, updateData);

              // Emit completion with metrics
              this.dataSourcesGateway.emitProcessingComplete(dataSourceId, {
                documents: documentsCount,
                vectors: vectorsCount,
                status: 'completed',
              });
            } else {
              // If no SUCCESS match, check if there's any indication of completion
              if (
                stdout.includes('completed successfully') ||
                stdout.includes('Pipeline completed')
              ) {
                await this.updateProcessingStatus(
                  dataSourceId,
                  DataSourceStatus.COMPLETED,
                );

                this.dataSourcesGateway.emitProcessingComplete(dataSourceId, {
                  status: 'completed',
                });
              } else {
                // If no clear success indication, mark as failed
                await this.updateProcessingStatus(
                  dataSourceId,
                  DataSourceStatus.FAILED,
                  'Processing completed but no success confirmation found',
                );
              }
            }
          }
        })
        .catch(async (error) => {
          console.error('Python script error:', error);

          // Emit execution error
          this.dataSourcesGateway.emitProcessingLog({
            dataSourceId,
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `💥 Execution error: ${error.message}`,
            step: 'error',
            progress: 100,
          });

          this.dataSourcesGateway.emitProcessingError(
            dataSourceId,
            error.message,
          );

          await this.updateProcessingStatus(
            dataSourceId,
            DataSourceStatus.FAILED,
            error.message,
          );
        });
    } catch (error) {
      console.error('Error triggering Python processing:', error);

      // Emit initialization error
      this.dataSourcesGateway.emitProcessingLog({
        dataSourceId,
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `🚨 Initialization error: ${error.message}`,
        step: 'error',
        progress: 100,
      });

      this.dataSourcesGateway.emitProcessingError(dataSourceId, error.message);

      await this.updateProcessingStatus(
        dataSourceId,
        DataSourceStatus.FAILED,
        error.message,
      );
    }
  }

  private async updateProcessingStatus(
    dataSourceId: string,
    status: DataSourceStatus,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: UpdateDataSourceDto = {
      status,
      processingCompletedAt: new Date(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await this.dataSourceRepository.update(dataSourceId, updateData);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.dataSourceRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findOne(id: DataSource['id']) {
    return this.dataSourceRepository.findById(id);
  }

  update(id: DataSource['id'], updateDataSourceDto: UpdateDataSourceDto) {
    return this.dataSourceRepository.update(id, updateDataSourceDto);
  }

  remove(id: DataSource['id']) {
    return this.dataSourceRepository.remove(id);
  }
}
