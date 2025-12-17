import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCategoriesUseCase } from '../../application/use-cases/categories/get-categories.use-case';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories() {
    return this.getCategoriesUseCase.execute();
  }
}
