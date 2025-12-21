import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetPaginatedUsersUseCase } from '../../application/use-cases/users/get-paginated-users.use-case';
import {
    ChangeUserRoleUseCase,
    ChangeUserRoleRequest,
} from '../../application/use-cases/users/change-user-role.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/users/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/users/update-user-profile.use-case';
import { PaginationDto } from '../../application/dtos/common/pagination.dto';
import { ChangeUserRoleDto } from '../../application/dtos/users/change-role.dto';
import { UpdateUserProfileDto } from '../../application/dtos/users/update-user-profile.dto';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/adapters/auth/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { Role } from '../../domain/enums/role.enum';
import type { User } from '../../domain/entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly getPaginatedUsersUseCase: GetPaginatedUsersUseCase,
        private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    ) {}

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUserProfile(@GetUser() user: User) {
        return this.getUserProfileUseCase.execute(user.id);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'User profile updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    async updateUserProfile(@GetUser() user: User, @Body() updateProfileDto: UpdateUserProfileDto) {
        return this.updateUserProfileUseCase.execute({
            userId: user.id,
            ...updateProfileDto,
        });
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getUsers(@Query() paginationDto: PaginationDto) {
        return this.getPaginatedUsersUseCase.execute(paginationDto);
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user role (Admin only)' })
    @ApiResponse({ status: 200, description: 'User role updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async changeUserRole(
        @Param('id') userId: string,
        @Body() changeRoleDto: ChangeUserRoleDto,
        @GetUser() currentUser: User,
    ) {
        const request: ChangeUserRoleRequest = {
            userId,
            role: changeRoleDto.role,
            currentUserId: currentUser.id,
        };

        return this.changeUserRoleUseCase.execute(request);
    }
}
