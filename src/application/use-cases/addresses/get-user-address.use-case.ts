import { Injectable, Inject } from '@nestjs/common';
import type { AddressRepository } from '../../ports/repositories/address.repository';
import { UserAddress } from '../../../domain/entities/address.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetUserAddressUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.ADDRESS_REPOSITORY)
        private readonly addressRepository: AddressRepository,
    ) {}

    async execute(userId: string): Promise<UserAddress | null> {
        return this.addressRepository.findByUserId(userId);
    }
}
