import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../ports/repositories/user.repository';
import type { AuthService } from '../../ports/services/auth.service';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
  token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(INJECTION_TOKENS.AUTH_SERVICE)
    private readonly authService: AuthService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationDomainException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ValidationDomainException('User is not active');
    }

    const isPasswordValid = await this.authService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationDomainException('Invalid credentials');
    }

    const token = this.authService.generateJwtToken({
      id: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      },
      token,
    };
  }
}
