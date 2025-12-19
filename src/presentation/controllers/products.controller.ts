import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetProductsUseCase } from '../../application/use-cases/products/get-products.use-case';
import { GetProductBySlugUseCase } from '../../application/use-cases/products/get-product-by-slug.use-case';
import { CreateProductUseCase } from '../../application/use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/products/delete-product.use-case';
import { DeleteProductImageUseCase } from '../../application/use-cases/products/delete-product-image.use-case';
import { GetProductsDto } from '../../application/dtos/products/get-products.dto';
import { CreateProductDto } from '../../application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/products/update-product.dto';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/adapters/auth/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { Role } from '../../domain/enums/role.enum';
import type { User } from '../../domain/entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly deleteProductImageUseCase: DeleteProductImageUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get products with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(@Query() getProductsDto: GetProductsDto) {
    return this.getProductsUseCase.execute(getProductsDto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.getProductBySlugUseCase.execute(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.createProductUseCase.execute({
      ...createProductDto,
      userId: user.id,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product image (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product image deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteProductImage(
    @Param('id') productId: string,
    @Body() body: { imageUrl: string },
  ) {
    await this.deleteProductImageUseCase.execute({
      productId,
      imageUrl: body.imageUrl,
    });
    return { message: 'Product image deleted successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteProduct(@Param('id') id: string) {
    await this.deleteProductUseCase.execute(id);
    return { message: 'Product deleted successfully' };
  }
}
