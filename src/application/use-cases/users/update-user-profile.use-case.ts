import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../ports/repositories/user.repository';
import { UpdateUserProfileDto } from '../../dtos/users/update-user-profile.dto';

export interface UpdateUserProfileRequest extends UpdateUserProfileDto {
    userId: string;
}

@Injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: UpdateUserProfileRequest) {
        const { userId, ...updateData } = request;

        // Check if user exists
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Check email uniqueness if email is being updated
        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithEmail = await this.userRepository.findByEmail(updateData.email);
            if (userWithEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // Hash password if provided
        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }

        // Update user
        const updatedUser = await this.userRepository.update(userId, updateData);

        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;

        return userWithoutPassword;
    }
}
