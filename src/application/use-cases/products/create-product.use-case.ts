import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
  categoryId: string;
  userId: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(request: CreateProductRequest): Promise<Product> {
    // Check if slug already exists
    const existingProduct = await this.productRepository.findBySlug(
      request.slug,
    );
    if (existingProduct) {
      throw new ValidationDomainException(
        'Product with this slug already exists',
      );
    }

    return this.productRepository.create(request);
  }
}
