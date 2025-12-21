import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { SearchProductsDto } from '../../dtos/products/search-products.dto';

@Injectable()
export class SearchProductsUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(searchDto: SearchProductsDto) {
        const { q, page = 1, limit = 10 } = searchDto;

        if (!q || q.trim() === '') {
            return {
                products: [],
                total: 0,
                page,
                totalPages: 0,
            };
        }

        const result = await this.productRepository.searchByTitle(q.trim(), {
            page,
            limit,
        });

        return {
            products: result.products,
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit),
        };
    }
}
