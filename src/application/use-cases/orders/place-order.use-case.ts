import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../ports/repositories/order.repository';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import { Order, OrderItem } from '../../../domain/entities/order.entity';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface PlaceOrderItem {
  productId: string;
  quantity: number;
  size: string;
}

export interface PlaceOrderRequest {
  userId: string;
  items: PlaceOrderItem[];
  address: {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    postalCode: string;
    city: string;
    phone: string;
    countryId: string;
  };
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(request: PlaceOrderRequest): Promise<Order> {
    const { userId, items } = request;

    // Validate products and calculate totals
    let subTotal = 0;
    const orderItems: Omit<OrderItem, 'id' | 'orderId'>[] = [];

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ValidationDomainException(
          `Product ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new ValidationDomainException(
          `Insufficient stock for product ${product.title}`,
        );
      }

      if (!product.sizes.includes(item.size)) {
        throw new ValidationDomainException(
          `Size ${item.size} not available for product ${product.title}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      subTotal += itemTotal;

      orderItems.push({
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        productId: item.productId,
      });
    }

    // Calculate tax (15%)
    const tax = subTotal * 0.15;
    const total = subTotal + tax;

    // Create order with address
    const orderData = {
      subTotal,
      tax,
      total,
      itemsInOrder: items.reduce((acc, item) => acc + item.quantity, 0),
      isPaid: false,
      userId,
      orderItems: orderItems as OrderItem[],
    };

    const order = await this.orderRepository.createWithAddress(
      orderData,
      request.address,
    );

    // Update product stock
    for (const item of items) {
      await this.productRepository.updateStock(item.productId, item.quantity);
    }

    return order;
  }
}
