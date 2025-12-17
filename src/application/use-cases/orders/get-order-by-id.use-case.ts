import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../ports/repositories/order.repository';
import { Order } from '../../../domain/entities/order.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundDomainException('Order', id);
    }

    return order;
  }
}
