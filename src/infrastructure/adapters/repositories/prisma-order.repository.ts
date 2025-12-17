import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../../application/ports/repositories/order.repository';
import { Order, OrderItem } from '../../../domain/entities/order.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
        OrderAddress: true,
      },
    });

    if (!order) return null;

    return this.mapToOrder(order);
  }

  async create(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    const { orderItems, ...order } = orderData;

    const createdOrder = await this.prisma.order.create({
      data: {
        ...order,
        OrderItem: {
          create: orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            size: item.size as any,
            productId: item.productId,
          })),
        },
      },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
        OrderAddress: true,
      },
    });

    return this.mapToOrder(createdOrder);
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        subTotal: orderData.subTotal,
        tax: orderData.tax,
        total: orderData.total,
        isPaid: orderData.isPaid,
        paidAt: orderData.paidAt,
        transactionId: orderData.transactionId,
      },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
        OrderAddress: true,
      },
    });

    return this.mapToOrder(updatedOrder);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
        OrderAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.mapToOrder(order));
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          OrderItem: {
            include: {
              product: true,
            },
          },
          OrderAddress: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count(),
    ]);

    return {
      orders: orders.map((order) => this.mapToOrder(order)),
      total,
    };
  }

  private mapToOrder(order: any): Order {
    return {
      id: order.id,
      subTotal: order.subTotal,
      tax: order.tax,
      total: order.total,
      itemsInOrder: order.itemsInOrder,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      transactionId: order.transactionId,
      userId: order.userId,
      orderItems: order.OrderItem.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        productId: item.productId,
        orderId: item.orderId,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
