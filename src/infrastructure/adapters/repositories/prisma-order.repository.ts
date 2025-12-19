import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../../application/ports/repositories/order.repository';
import { Order } from '../../../domain/entities/order.entity';
import { OrderAddress } from '../../../domain/entities/address.entity';
import { Size } from '../../../domain/enums/size.enum';
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
            product: {
              include: {
                ProductImage: true,
              },
            },
          },
        },
        OrderAddress: true,
      },
    });

    if (!order) return null;

    return this.mapToOrder(order);
  }

  async findByTransactionId(transactionId: string): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: { transactionId },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: true,
              },
            },
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
            size: item.size as Size,
            productId: item.productId,
          })),
        },
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: true,
              },
            },
          },
        },
        OrderAddress: true,
      },
    });

    return this.mapToOrder(createdOrder);
  }

  async createWithAddress(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    addressData: Omit<OrderAddress, 'id' | 'orderId'>,
  ): Promise<Order> {
    const { orderItems, ...order } = orderData;

    const createdOrder = await this.prisma.order.create({
      data: {
        ...order,
        OrderItem: {
          create: orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            size: item.size as Size,
            productId: item.productId,
          })),
        },
        OrderAddress: {
          create: {
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            address: addressData.address,
            address2: addressData.address2,
            postalCode: addressData.postalCode,
            city: addressData.city,
            phone: addressData.phone,
            countryId: addressData.countryId,
          },
        },
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: true,
              },
            },
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
            product: {
              include: {
                ProductImage: true,
              },
            },
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
            product: {
              include: {
                ProductImage: true,
              },
            },
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
              product: {
                include: {
                  ProductImage: true,
                },
              },
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

  private mapToOrder(order: {
    id: string;
    subTotal: number;
    tax: number;
    total: number;
    itemsInOrder: number;
    isPaid: boolean;
    paidAt: Date | null;
    transactionId: string | null;
    userId: string;
    OrderItem?: Array<{
      id: string;
      quantity: number;
      price: number;
      size: string;
      productId: string;
      orderId: string;
      product?: {
        id: string;
        title: string;
        slug: string;
        ProductImage: Array<{
          id: number;
          url: string;
          productId: string;
        }>;
      };
    }>;
    OrderAddress?: {
      id: string;
      firstName: string;
      lastName: string;
      address: string;
      address2: string | null;
      postalCode: string;
      city: string;
      phone: string;
      countryId: string;
      orderId: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return {
      id: order.id,
      subTotal: order.subTotal,
      tax: order.tax,
      total: order.total,
      itemsInOrder: order.itemsInOrder,
      isPaid: order.isPaid,
      paidAt: order.paidAt || undefined,
      transactionId: order.transactionId || undefined,
      userId: order.userId,
      orderItems:
        order.OrderItem?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          productId: item.productId,
          orderId: item.orderId,
          product: item.product
            ? {
                id: item.product.id,
                title: item.product.title,
                slug: item.product.slug,
                ProductImage: item.product.ProductImage || [],
              }
            : undefined,
        })) || [],
      orderAddress: order.OrderAddress
        ? {
            id: order.OrderAddress.id,
            firstName: order.OrderAddress.firstName,
            lastName: order.OrderAddress.lastName,
            address: order.OrderAddress.address,
            address2: order.OrderAddress.address2 || undefined,
            postalCode: order.OrderAddress.postalCode,
            city: order.OrderAddress.city,
            phone: order.OrderAddress.phone,
            countryId: order.OrderAddress.countryId,
            orderId: order.OrderAddress.orderId,
          }
        : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
