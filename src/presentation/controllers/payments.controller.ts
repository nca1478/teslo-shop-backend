import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SetTransactionIdUseCase } from '../../application/use-cases/payments/set-transaction-id.use-case';
import { PayPalCheckPaymentUseCase } from '../../application/use-cases/payments/paypal-check-payment.use-case';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly setTransactionIdUseCase: SetTransactionIdUseCase,
    private readonly paypalCheckPaymentUseCase: PayPalCheckPaymentUseCase,
  ) {}

  @Post('set-transaction-id')
  @ApiOperation({ summary: 'Set transaction ID for order' })
  @ApiResponse({ status: 200, description: 'Transaction ID set successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async setTransactionId(
    @Body() body: { orderId: string; transactionId: string },
  ) {
    return this.setTransactionIdUseCase.execute(body);
  }

  @Post('paypal/check')
  @ApiOperation({ summary: 'Verify PayPal payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  async checkPayPalPayment(@Body() body: { paypalTransactionId: string }) {
    return this.paypalCheckPaymentUseCase.execute(body);
  }
}
