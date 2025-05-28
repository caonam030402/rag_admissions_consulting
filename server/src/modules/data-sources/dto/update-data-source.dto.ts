import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    CreateDataSourceDto,
    DataSourceStatus,
} from './create-data-source.dto';
import {
    IsEnum,
    IsOptional,
    IsNumber,
    IsString,
    IsDate,
} from 'class-validator';

export class UpdateDataSourceDto extends PartialType(CreateDataSourceDto) {
    @ApiProperty({
        description: 'Trạng thái xử lý',
        enum: DataSourceStatus,
        required: false,
    })
    @IsEnum(DataSourceStatus)
    @IsOptional()
    status?: DataSourceStatus;

    @ApiProperty({
        description: 'Số lượng documents đã xử lý',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    documentsCount?: number;

    @ApiProperty({
        description: 'Số lượng vectors đã tạo',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    vectorsCount?: number;

    @ApiProperty({
        description: 'Đường dẫn file (cho file upload)',
        required: false,
    })
    @IsString()
    @IsOptional()
    filePath?: string;

    @ApiProperty({
        description: 'Thời gian bắt đầu xử lý',
        required: false,
    })
    @IsDate()
    @IsOptional()
    processingStartedAt?: Date;

    @ApiProperty({
        description: 'Thời gian hoàn thành xử lý',
        required: false,
    })
    @IsDate()
    @IsOptional()
    processingCompletedAt?: Date;

    @ApiProperty({
        description: 'Thông báo lỗi (nếu có)',
        required: false,
    })
    @IsString()
    @IsOptional()
    errorMessage?: string;
}
