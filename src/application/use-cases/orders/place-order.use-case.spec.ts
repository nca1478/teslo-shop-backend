import { Test, TestingModule } from '@nestjs/testing';
import { PlaceOrderUseCase } from './place-order.use-case';
import { OrderRepository } from '../../ports/repositories/order.repository';
import { ProductRepository } from '../../ports/repositories/product.repository';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import { Gender } from '../../../domain/enums/gender.enum';
import { Size } from '../../../domain/enums/size.enum';

describe('PlaceOrderUseCase', () => {
  let useCase: PlaceOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const mockOrderRepository = {
      create: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceOrderUseCase,
        {
          provide: INJECTION_TOKENS.ORDER_REPOSITORY,
          useValue: mockOrderRepository,
        },
        {
          provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<PlaceOrderUseCase>(PlaceOrderUseCase);
    orderRepository = module.get(INJECTION_TOKENS.ORDER_REPOSITORY);
    productRepository = module.get(INJECTION_TOKENS.PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ValidationDomainException when product not found', async () => {
    productRepository.findById.mockResolvedValue(null);

    const request = {
      userId: 'user1',
      items: [{ productId: 'nonexistent', quantity: 1, size: 'M' }],
      address: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        postalCode: '12345',
        city: 'New York',
        phone: '555-1234',
        countryId: 'US',
      },
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      ValidationDomainException,
    );
  });

  it('should throw ValidationDomainException when insufficient stock', async () => {
    const product = {
      id: 'prod1',
      title: 'Test Product',
      price: 100,
      description: 'Test Description',
      slug: 'test-product',
      stock: 2,
      sizes: [Size.M],
      gender: Gender.MEN,
      tags: ['test'],
      images: ['test.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    productRepository.findById.mockResolvedValue(product);

    const request = {
      userId: 'user1',
      items: [{ productId: 'prod1', quantity: 5, size: 'M' }],
      address: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        postalCode: '12345',
        city: 'New York',
        phone: '555-1234',
        countryId: 'US',
      },
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      ValidationDomainException,
    );
  });

  it('should create order successfully', async () => {
    const product = {
      id: 'prod1',
      title: 'Test Product',
      price: 100,
      description: 'Test Description',
      slug: 'test-product',
      stock: 10,
      sizes: [Size.M],
      gender: Gender.MEN,
      tags: ['test'],
      images: ['test.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdOrder = {
      id: 'order1',
      subTotal: 200,
      tax: 30,
      total: 230,
      itemsInOrder: 2,
      isPaid: false,
      userId: 'user1',
      orderItems: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    productRepository.findById.mockResolvedValue(product);
    orderRepository.create.mockResolvedValue(createdOrder);

    const request = {
      userId: 'user1',
      items: [{ productId: 'prod1', quantity: 2, size: 'M' }],
      address: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        postalCode: '12345',
        city: 'New York',
        phone: '555-1234',
        countryId: 'US',
      },
    };

    const result = await useCase.execute(request);

    expect(result).toEqual(createdOrder);
    expect(productRepository.updateStock).toHaveBeenCalledWith('prod1', 2);
  });
});
