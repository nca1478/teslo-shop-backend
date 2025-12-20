import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../ports/repositories/order.repository';
import { Order } from '../../../domain/entities/order.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetOrdersByUserUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(userId: string): Promise<Order[]> {
        return this.orderRepository.findByUserId(userId);
    }
}
