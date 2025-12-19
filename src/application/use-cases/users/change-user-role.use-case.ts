import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../ports/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import {
  NotFoundDomainException,
  ValidationDomainException,
} from '../../../domain/exceptions/domain.exception';
import { Role } from '../../../domain/enums/role.enum';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface ChangeUserRoleRequest {
  userId: string;
  role: Role;
  currentUserId: string;
}

@Injectable()
export class ChangeUserRoleUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    request: ChangeUserRoleRequest,
  ): Promise<Omit<User, 'password'>> {
    const { userId, role, currentUserId } = request;

    if (userId === currentUserId) {
      throw new ValidationDomainException('Cannot change your own role');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainException('User', userId);
    }

    if (!Object.values(Role).includes(role)) {
      throw new ValidationDomainException('Invalid role');
    }

    const updatedUser = await this.userRepository.update(userId, {
      roles: [role],
    });

    // Remove password from response
    const { password, ...safeUser } = updatedUser;
    void password; // Explicitly ignore password variable
    return safeUser;
  }
}
