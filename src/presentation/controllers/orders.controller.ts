import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlaceOrderUseCase } from '../../application/use-cases/orders/place-order.use-case';
import { GetOrderByIdUseCase } from '../../application/use-cases/orders/get-order-by-id.use-case';
import { GetOrdersByUserUseCase } from '../../application/use-cases/orders/get-orders-by-user.use-case';
import { GetPaginatedOrdersUseCase } from '../../application/use-cases/orders/get-paginated-orders.use-case';
import { PlaceOrderDto } from '../../application/dtos/orders/place-order.dto';
import { PaginationDto } from '../../application/dtos/common/pagination.dto';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/adapters/auth/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { Role } from '../../domain/enums/role.enum';
import type { User } from '../../domain/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrderUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getOrdersByUserUseCase: GetOrdersByUserUseCase,
    private readonly getPaginatedOrdersUseCase: GetPaginatedOrdersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async placeOrder(
    @Body() placeOrderDto: PlaceOrderDto,
    @GetUser() user: User,
  ) {
    return this.placeOrderUseCase.execute({
      ...placeOrderDto,
      userId: user.id,
    });
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getMyOrders(@GetUser() user: User) {
    return this.getOrdersByUserUseCase.execute(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders with pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllOrders(@Query() paginationDto: PaginationDto) {
    return this.getPaginatedOrdersUseCase.execute(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string) {
    return this.getOrderByIdUseCase.execute(id);
  }
}
