import { Injectable, Inject } from '@nestjs/common';
import type { CountryRepository } from '../../ports/repositories/country.repository';
import { Country } from '../../../domain/entities/country.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class GetCountriesUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.COUNTRY_REPOSITORY)
        private readonly countryRepository: CountryRepository,
    ) {}

    async execute(): Promise<Country[]> {
        return this.countryRepository.findAll();
    }
}
