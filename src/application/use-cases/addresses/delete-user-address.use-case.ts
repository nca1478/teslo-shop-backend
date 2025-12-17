import { Injectable, Inject } from '@nestjs/common';
import type { AddressRepository } from '../../ports/repositories/address.repository';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class DeleteUserAddressUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const address = await this.addressRepository.findByUserId(userId);
    if (!address) {
      throw new NotFoundDomainException('Address', userId);
    }

    await this.addressRepository.delete(address.id);
  }
}
