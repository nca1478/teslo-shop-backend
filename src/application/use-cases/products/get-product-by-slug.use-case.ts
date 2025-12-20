import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetProductBySlugUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(slug: string): Promise<Product> {
        const product = await this.productRepository.findBySlug(slug);

        if (!product) {
            throw new NotFoundDomainException('Product', slug);
        }

        return product;
    }
}
