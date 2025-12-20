import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { UserRepository } from '../../ports/repositories/user.repository';
import { AuthService } from '../../ports/services/auth.service';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let authService: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const mockUserRepository = {
            findByEmail: jest.fn(),
        };

        const mockAuthService = {
            comparePasswords: jest.fn(),
            generateJwtToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                {
                    provide: INJECTION_TOKENS.USER_REPOSITORY,
                    useValue: mockUserRepository,
                },
                {
                    provide: INJECTION_TOKENS.AUTH_SERVICE,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        useCase = module.get<LoginUseCase>(LoginUseCase);
        userRepository = module.get(INJECTION_TOKENS.USER_REPOSITORY);
        authService = module.get(INJECTION_TOKENS.AUTH_SERVICE);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw ValidationDomainException when user not found', async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute({ email: 'test@test.com', password: '123456' }),
        ).rejects.toThrow(ValidationDomainException);
    });

    it('should throw ValidationDomainException when user is not active', async () => {
        const user = {
            id: '1',
            email: 'test@test.com',
            password: 'hashedPassword',
            fullName: 'Test User',
            isActive: false,
            roles: ['user'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        userRepository.findByEmail.mockResolvedValue(user);

        await expect(
            useCase.execute({ email: 'test@test.com', password: '123456' }),
        ).rejects.toThrow(ValidationDomainException);
    });

    it('should return user and token when login is successful', async () => {
        const user = {
            id: '1',
            email: 'test@test.com',
            password: 'hashedPassword',
            fullName: 'Test User',
            isActive: true,
            roles: ['user'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        userRepository.findByEmail.mockResolvedValue(user);
        authService.comparePasswords.mockResolvedValue(true);
        authService.generateJwtToken.mockReturnValue('jwt-token');

        const result = await useCase.execute({
            email: 'test@test.com',
            password: '123456',
        });

        expect(result).toEqual({
            user: {
                id: '1',
                email: 'test@test.com',
                fullName: 'Test User',
                roles: ['user'],
            },
            token: 'jwt-token',
        });
    });
});
