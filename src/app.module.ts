import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure
import { PrismaService } from './infrastructure/database/prisma.service';
import { PrismaUserRepository } from './infrastructure/adapters/repositories/prisma-user.repository';
import { PrismaProductRepository } from './infrastructure/adapters/repositories/prisma-product.repository';
import { PrismaOrderRepository } from './infrastructure/adapters/repositories/prisma-order.repository';
import { PrismaCategoryRepository } from './infrastructure/adapters/repositories/prisma-category.repository';
import { PrismaCountryRepository } from './infrastructure/adapters/repositories/prisma-country.repository';
import { PrismaAddressRepository } from './infrastructure/adapters/repositories/prisma-address.repository';
import { JwtAuthService } from './infrastructure/adapters/auth/jwt-auth.service';
import { JwtStrategy } from './infrastructure/adapters/auth/jwt.strategy';
import { HttpExceptionFilter } from './infrastructure/common/filters/http-exception.filter';
import { PayPalAdapter } from './infrastructure/adapters/external/paypal.adapter';

// Application - Auth
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { RegisterUseCase } from './application/use-cases/auth/register.use-case';

// Application - Products
import { GetProductsUseCase } from './application/use-cases/products/get-products.use-case';
import { GetProductBySlugUseCase } from './application/use-cases/products/get-product-by-slug.use-case';
import { CreateProductUseCase } from './application/use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/products/delete-product.use-case';

// Application - Orders
import { PlaceOrderUseCase } from './application/use-cases/orders/place-order.use-case';
import { GetOrderByIdUseCase } from './application/use-cases/orders/get-order-by-id.use-case';
import { GetOrdersByUserUseCase } from './application/use-cases/orders/get-orders-by-user.use-case';
import { GetPaginatedOrdersUseCase } from './application/use-cases/orders/get-paginated-orders.use-case';

// Application - Users
import { GetPaginatedUsersUseCase } from './application/use-cases/users/get-paginated-users.use-case';
import { ChangeUserRoleUseCase } from './application/use-cases/users/change-user-role.use-case';

// Application - Categories & Countries
import { GetCategoriesUseCase } from './application/use-cases/categories/get-categories.use-case';
import { GetCountriesUseCase } from './application/use-cases/countries/get-countries.use-case';

// Application - Addresses
import { SetUserAddressUseCase } from './application/use-cases/addresses/set-user-address.use-case';
import { GetUserAddressUseCase } from './application/use-cases/addresses/get-user-address.use-case';
import { DeleteUserAddressUseCase } from './application/use-cases/addresses/delete-user-address.use-case';

// Application - Payments
import { SetTransactionIdUseCase } from './application/use-cases/payments/set-transaction-id.use-case';
import { PayPalCheckPaymentUseCase } from './application/use-cases/payments/paypal-check-payment.use-case';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { ProductsController } from './presentation/controllers/products.controller';
import { OrdersController } from './presentation/controllers/orders.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { CategoriesController } from './presentation/controllers/categories.controller';
import { CountriesController } from './presentation/controllers/countries.controller';
import { AddressesController } from './presentation/controllers/addresses.controller';
import { PaymentsController } from './presentation/controllers/payments.controller';
import { HealthController } from './presentation/controllers/health.controller';

// Constants
import { INJECTION_TOKENS } from './shared/constants/injection-tokens';

// Config
import databaseConfig from './infrastructure/config/database.config';
import jwtConfig from './infrastructure/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    ProductsController,
    OrdersController,
    UsersController,
    CategoriesController,
    CountriesController,
    AddressesController,
    PaymentsController,
    HealthController,
  ],
  providers: [
    AppService,
    PrismaService,
    JwtStrategy,

    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Repositories
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: INJECTION_TOKENS.ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: INJECTION_TOKENS.CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    {
      provide: INJECTION_TOKENS.COUNTRY_REPOSITORY,
      useClass: PrismaCountryRepository,
    },
    {
      provide: INJECTION_TOKENS.ADDRESS_REPOSITORY,
      useClass: PrismaAddressRepository,
    },

    // Services
    {
      provide: INJECTION_TOKENS.AUTH_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: INJECTION_TOKENS.PAYPAL_SERVICE,
      useClass: PayPalAdapter,
    },

    // Auth Use Cases
    LoginUseCase,
    RegisterUseCase,

    // Product Use Cases
    GetProductsUseCase,
    GetProductBySlugUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,

    // Order Use Cases
    PlaceOrderUseCase,
    GetOrderByIdUseCase,
    GetOrdersByUserUseCase,
    GetPaginatedOrdersUseCase,

    // User Use Cases
    GetPaginatedUsersUseCase,
    ChangeUserRoleUseCase,

    // Category & Country Use Cases
    GetCategoriesUseCase,
    GetCountriesUseCase,

    // Address Use Cases
    SetUserAddressUseCase,
    GetUserAddressUseCase,
    DeleteUserAddressUseCase,

    // Payment Use Cases
    SetTransactionIdUseCase,
    PayPalCheckPaymentUseCase,
  ],
})
export class AppModule {}
