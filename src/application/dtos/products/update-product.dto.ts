import { IsString, IsNumber, IsArray, IsOptional, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../domain/enums/gender.enum';
import { Size } from '../../../domain/enums/size.enum';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsArray()
    @IsIn(Object.values(Size), { each: true })
    sizes?: Size[];

    @IsOptional()
    @IsString()
    @IsIn(Object.values(Gender))
    gender?: Gender;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    categoryId?: string;
}
