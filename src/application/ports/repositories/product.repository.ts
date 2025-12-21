import { Product } from '../../../domain/entities/product.entity';

export interface ProductRepository {
    findById(id: string): Promise<Product | null>;
    findBySlug(slug: string): Promise<Product | null>;
    create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
    update(id: string, product: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<void>;
    deleteProductImage(productId: string, imageUrl: string): Promise<void>;
    findAll(filters: {
        page: number;
        limit: number;
        gender?: string;
        category?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ products: Product[]; total: number }>;
    searchByTitle(
        searchTerm: string,
        pagination: { page: number; limit: number },
    ): Promise<{ products: Product[]; total: number }>;
    updateStock(id: string, quantity: number): Promise<void>;
}
