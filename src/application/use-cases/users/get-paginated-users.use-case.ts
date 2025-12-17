import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../ports/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface GetPaginatedUsersRequest {
  page?: number;
  limit?: number;
}

export interface GetPaginatedUsersResponse {
  users: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetPaginatedUsersUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    request: GetPaginatedUsersRequest,
  ): Promise<GetPaginatedUsersResponse> {
    const { page = 1, limit = 10 } = request;

    const { users, total } = await this.userRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user);

    return {
      users: safeUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
