import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../application/ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        ProductImage: true,
        Category: true,
      },
    });

    if (!product) return null;

    return this.mapToProduct(product);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        ProductImage: true,
        Category: true,
      },
    });

    if (!product) return null;

    return this.mapToProduct(product);
  }

  async create(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        title: productData.title,
        description: productData.description,
        inStock: productData.stock,
        price: productData.price,
        sizes: productData.sizes as any[],
        slug: productData.slug,
        tags: productData.tags,
        gender: productData.gender as any,
        categoryId: productData.categoryId,
        ProductImage: {
          create: productData.images.map((url) => ({ url })),
        },
      },
      include: {
        ProductImage: true,
        Category: true,
      },
    });

    return this.mapToProduct(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const updateData: any = {};

    if (productData.title) updateData.title = productData.title;
    if (productData.description)
      updateData.description = productData.description;
    if (productData.stock !== undefined) updateData.inStock = productData.stock;
    if (productData.price !== undefined) updateData.price = productData.price;
    if (productData.sizes) updateData.sizes = productData.sizes;
    if (productData.slug) updateData.slug = productData.slug;
    if (productData.tags) updateData.tags = productData.tags;
    if (productData.gender) updateData.gender = productData.gender;
    if (productData.categoryId) updateData.categoryId = productData.categoryId;

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        ProductImage: true,
        Category: true,
      },
    });

    return this.mapToProduct(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findAll(filters: {
    page: number;
    limit: number;
    gender?: string;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const { page, limit, gender, category, search } = filters;

    const where: any = {};

    if (gender) where.gender = gender;
    if (category)
      where.Category = { name: { contains: category, mode: 'insensitive' } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ProductImage: true,
          Category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => this.mapToProduct(product)),
      total,
    };
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        inStock: {
          decrement: quantity,
        },
      },
    });
  }

  private mapToProduct(product: any): Product {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      slug: product.slug,
      stock: product.inStock,
      sizes: product.sizes,
      gender: product.gender,
      tags: product.tags,
      images: product.ProductImage.map((img: any) => img.url),
      categoryId: product.categoryId,
      userId: '', // Not available in current schema
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
