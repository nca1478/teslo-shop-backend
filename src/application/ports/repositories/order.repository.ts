import { Order } from '../../../domain/entities/order.entity';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }>;
}
