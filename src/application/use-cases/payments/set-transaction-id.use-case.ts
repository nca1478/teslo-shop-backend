import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../ports/repositories/order.repository';
import { Order } from '../../../domain/entities/order.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface SetTransactionIdRequest {
    orderId: string;
    transactionId: string;
}

@Injectable()
export class SetTransactionIdUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(request: SetTransactionIdRequest): Promise<Order> {
        const { orderId, transactionId } = request;

        // Check if order exists
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundDomainException('Order', orderId);
        }

        // Update order with transaction ID only
        return this.orderRepository.update(orderId, {
            transactionId,
        });
    }
}
