import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import {
  NotFoundDomainException,
  ValidationDomainException,
} from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  slug?: string;
  stock?: number;
  sizes?: string[];
  gender?: string;
  tags?: string[];
  images?: string[];
  categoryId?: string;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, request: UpdateProductRequest): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundDomainException('Product', id);
    }

    // Check if new slug is unique (if provided)
    if (request.slug && request.slug !== existingProduct.slug) {
      const productWithSlug = await this.productRepository.findBySlug(
        request.slug,
      );
      if (productWithSlug) {
        throw new ValidationDomainException(
          'Product with this slug already exists',
        );
      }
    }

    return this.productRepository.update(id, request);
  }
}
