import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../ports/repositories/user.repository';
import type { AuthService } from '../../ports/services/auth.service';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';
import { Role } from '../../../domain/enums/role.enum';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
  token: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(INJECTION_TOKENS.AUTH_SERVICE)
    private readonly authService: AuthService,
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, name } = request;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationDomainException('User already exists');
    }

    const hashedPassword = await this.authService.hashPassword(password);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      isActive: true,
      roles: [Role.USER],
    });

    const token = this.authService.generateJwtToken({
      id: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
    };
  }
}
