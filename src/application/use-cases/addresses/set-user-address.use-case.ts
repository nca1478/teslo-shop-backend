import { Injectable, Inject } from '@nestjs/common';
import type { AddressRepository } from '../../ports/repositories/address.repository';
import type { CountryRepository } from '../../ports/repositories/country.repository';
import { UserAddress } from '../../../domain/entities/address.entity';
import {
  ValidationDomainException,
  NotFoundDomainException,
} from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface SetUserAddressRequest {
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  phone: string;
  city: string;
  countryId: string;
}

@Injectable()
export class SetUserAddressUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepository,
    @Inject(INJECTION_TOKENS.COUNTRY_REPOSITORY)
    private readonly countryRepository: CountryRepository,
  ) {}

  async execute(request: SetUserAddressRequest): Promise<UserAddress> {
    const { userId, countryId, ...addressData } = request;

    // Validate country exists
    const country = await this.countryRepository.findById(countryId);
    if (!country) {
      throw new NotFoundDomainException('Country', countryId);
    }

    // Check if user already has an address
    const existingAddress = await this.addressRepository.findByUserId(userId);

    if (existingAddress) {
      // Update existing address
      return this.addressRepository.update(existingAddress.id, {
        ...addressData,
        countryId,
      });
    } else {
      // Create new address
      return this.addressRepository.create({
        ...addressData,
        countryId,
        userId,
      });
    }
  }
}
