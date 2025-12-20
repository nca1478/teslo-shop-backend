import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: {
                email: {
                    contains: 'test',
                },
            },
        });

        await app.close();
    });

    describe('/auth/register (POST)', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '123456',
                    fullName: 'Test User',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('user');
                    expect(res.body).toHaveProperty('token');
                    expect(res.body.user.email).toBe('test@example.com');
                    expect(res.body.user.fullName).toBe('Test User');
                });
        });

        it('should return 400 for invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123456',
                    fullName: 'Test User',
                })
                .expect(400);
        });

        it('should return 400 for short password', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '123',
                    fullName: 'Test User',
                })
                .expect(400);
        });
    });

    describe('/auth/login (POST)', () => {
        beforeEach(async () => {
            // Create a test user
            await request(app.getHttpServer()).post('/api/auth/register').send({
                email: 'test-login@example.com',
                password: '123456',
                fullName: 'Test Login User',
            });
        });

        it('should login with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test-login@example.com',
                    password: '123456',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('user');
                    expect(res.body).toHaveProperty('token');
                    expect(res.body.user.email).toBe('test-login@example.com');
                });
        });

        it('should return 400 for invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test-login@example.com',
                    password: 'wrongpassword',
                })
                .expect(400);
        });

        it('should return 400 for non-existent user', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: '123456',
                })
                .expect(400);
        });
    });
});
