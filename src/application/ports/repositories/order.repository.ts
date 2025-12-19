import { Order } from '../../../domain/entities/order.entity';
import { OrderAddress } from '../../../domain/entities/address.entity';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  createWithAddress(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    address: Omit<OrderAddress, 'id' | 'orderId'>,
  ): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }>;
}
