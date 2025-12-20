import { IsString, IsNumber, IsArray, Min, IsIn, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../domain/enums/gender.enum';
import { Size } from '../../../domain/enums/size.enum';

export class CreateProductDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    slug: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    stock: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsIn(Object.values(Size), { each: true })
    sizes: Size[];

    @IsString()
    @IsIn(Object.values(Gender))
    gender: Gender;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsArray()
    @IsString({ each: true })
    images: string[];

    @IsString()
    categoryId: string;
}
