import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundDomainException('Product', id);
    }

    await this.productRepository.delete(id);
  }
}
