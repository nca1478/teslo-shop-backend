import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
    SetUserAddressUseCase,
    SetUserAddressRequest,
} from '../../application/use-cases/addresses/set-user-address.use-case';
import { GetUserAddressUseCase } from '../../application/use-cases/addresses/get-user-address.use-case';
import { DeleteUserAddressUseCase } from '../../application/use-cases/addresses/delete-user-address.use-case';
import { JwtAuthGuard } from '../../infrastructure/adapters/auth/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import type { User } from '../../domain/entities/user.entity';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
    constructor(
        private readonly setUserAddressUseCase: SetUserAddressUseCase,
        private readonly getUserAddressUseCase: GetUserAddressUseCase,
        private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get current user address' })
    @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async getUserAddress(@GetUser() user: User) {
        return this.getUserAddressUseCase.execute(user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Set user address' })
    @ApiResponse({ status: 201, description: 'Address set successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async setUserAddress(
        @Body() addressData: Omit<SetUserAddressRequest, 'userId'>,
        @GetUser() user: User,
    ) {
        return this.setUserAddressUseCase.execute({
            ...addressData,
            userId: user.id,
        });
    }

    @Delete()
    @ApiOperation({ summary: 'Delete user address' })
    @ApiResponse({ status: 200, description: 'Address deleted successfully' })
    @ApiResponse({ status: 404, description: 'Address not found' })
    async deleteUserAddress(@GetUser() user: User) {
        await this.deleteUserAddressUseCase.execute(user.id);
        return { message: 'Address deleted successfully' };
    }
}
