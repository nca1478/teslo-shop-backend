import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface GetProductsRequest {
  page?: number;
  limit?: number;
  gender?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(request: GetProductsRequest): Promise<GetProductsResponse> {
    const {
      page = 1,
      limit = 12,
      gender,
      category,
      search,
      sortBy = 'title',
      sortOrder = 'asc',
    } = request;

    const { products, total } = await this.productRepository.findAll({
      page,
      limit,
      gender,
      category,
      search,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
