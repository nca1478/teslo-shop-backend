import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('ProductsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        // Get admin token
        const adminLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
            email: 'admin@teslo.com',
            password: '123456',
        });
        adminToken = adminLogin.body.token;

        // Get user token
        const userLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
            email: 'user@teslo.com',
            password: '123456',
        });
        userToken = userLogin.body.token;
    });

    afterEach(async () => {
        // Clean up test products
        await prisma.product.deleteMany({
            where: {
                title: {
                    contains: 'Test',
                },
            },
        });

        await app.close();
    });

    describe('/products (GET)', () => {
        it('should get products without authentication', () => {
            return request(app.getHttpServer())
                .get('/api/products')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('products');
                    expect(res.body).toHaveProperty('total');
                    expect(res.body).toHaveProperty('page');
                    expect(res.body).toHaveProperty('limit');
                    expect(Array.isArray(res.body.products)).toBe(true);
                });
        });

        it('should filter products by gender', () => {
            return request(app.getHttpServer())
                .get('/api/products?gender=men')
                .expect(200)
                .expect((res) => {
                    expect(res.body.products.every((p: any) => p.gender === 'men')).toBe(true);
                });
        });
    });

    describe('/products (POST)', () => {
        it('should create product as admin', async () => {
            const category = await prisma.category.findFirst();

            return request(app.getHttpServer())
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Test Product',
                    description: 'Test Description',
                    price: 99.99,
                    slug: 'test-product-unique',
                    stock: 10,
                    sizes: ['M', 'L'],
                    gender: 'men',
                    tags: ['test'],
                    images: ['test.jpg'],
                    categoryId: category?.id,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.title).toBe('Test Product');
                    expect(res.body.price).toBe(99.99);
                });
        });

        it('should reject product creation as regular user', async () => {
            const category = await prisma.category.findFirst();

            return request(app.getHttpServer())
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Test Product',
                    description: 'Test Description',
                    price: 99.99,
                    slug: 'test-product-user',
                    stock: 10,
                    sizes: ['M', 'L'],
                    gender: 'men',
                    tags: ['test'],
                    images: ['test.jpg'],
                    categoryId: category?.id,
                })
                .expect(403);
        });

        it('should reject product creation without authentication', async () => {
            const category = await prisma.category.findFirst();

            return request(app.getHttpServer())
                .post('/api/products')
                .send({
                    title: 'Test Product',
                    description: 'Test Description',
                    price: 99.99,
                    slug: 'test-product-no-auth',
                    stock: 10,
                    sizes: ['M', 'L'],
                    gender: 'men',
                    tags: ['test'],
                    images: ['test.jpg'],
                    categoryId: category?.id,
                })
                .expect(401);
        });
    });
});
