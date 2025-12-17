import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../../application/ports/repositories/category.repository';
import { Category } from '../../../domain/entities/category.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async create(
    categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: categoryData.name,
      },
    });

    return {
      id: category.id,
      name: category.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: categoryData.name,
      },
    });

    return {
      id: category.id,
      name: category.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
