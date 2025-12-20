import { Injectable, Inject } from '@nestjs/common';
import type { CategoryRepository } from '../../ports/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetCategoriesUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async execute(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }
}
