import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from './create-product.use-case';
import { ProductRepository } from '../../ports/repositories/product.repository';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import { Gender } from '../../../domain/enums/gender.enum';
import { Size } from '../../../domain/enums/size.enum';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const mockProductRepository = {
      findBySlug: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepository = module.get(INJECTION_TOKENS.PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ValidationDomainException when slug already exists', async () => {
    const existingProduct = {
      id: '1',
      title: 'Existing Product',
      slug: 'existing-product',
      price: 100,
      description: 'Description',
      stock: 10,
      sizes: [Size.M],
      gender: Gender.MEN,
      tags: ['tag1'],
      images: ['image1.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    productRepository.findBySlug.mockResolvedValue(existingProduct);

    const request = {
      title: 'New Product',
      description: 'New Description',
      price: 50,
      slug: 'existing-product',
      stock: 5,
      sizes: ['M'],
      gender: 'men',
      tags: ['new'],
      images: ['new.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      ValidationDomainException,
    );
  });

  it('should create product when slug is unique', async () => {
    const newProduct = {
      id: '2',
      title: 'New Product',
      slug: 'new-product',
      price: 50,
      description: 'New Description',
      stock: 5,
      sizes: [Size.M],
      gender: Gender.MEN,
      tags: ['new'],
      images: ['new.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    productRepository.findBySlug.mockResolvedValue(null);
    productRepository.create.mockResolvedValue(newProduct);

    const request = {
      title: 'New Product',
      description: 'New Description',
      price: 50,
      slug: 'new-product',
      stock: 5,
      sizes: ['M'],
      gender: 'men',
      tags: ['new'],
      images: ['new.jpg'],
      categoryId: 'cat1',
      userId: 'user1',
    };

    const result = await useCase.execute(request);

    expect(result).toEqual(newProduct);
    expect(productRepository.findBySlug).toHaveBeenCalledWith('new-product');
    expect(productRepository.create).toHaveBeenCalledWith(request);
  });
});
