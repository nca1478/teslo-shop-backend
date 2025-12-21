import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchProductsDto {
    @ApiProperty({
        description: 'Search term for product title',
        example: 'shirt',
        required: false,
    })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiProperty({
        description: 'Page number',
        example: 1,
        default: 1,
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number = 10;
}
