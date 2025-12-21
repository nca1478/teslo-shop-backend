import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../ports/repositories/user.repository';

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}
