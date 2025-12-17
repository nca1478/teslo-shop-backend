import { Category } from '../../../domain/entities/category.entity';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}
