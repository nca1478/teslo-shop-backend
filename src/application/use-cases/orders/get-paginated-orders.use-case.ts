import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../ports/repositories/order.repository';
import { Order } from '../../../domain/entities/order.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface GetPaginatedOrdersRequest {
  page?: number;
  limit?: number;
}

export interface GetPaginatedOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetPaginatedOrdersUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    request: GetPaginatedOrdersRequest,
  ): Promise<GetPaginatedOrdersResponse> {
    const { page = 1, limit = 10 } = request;

    const { orders, total } = await this.orderRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
