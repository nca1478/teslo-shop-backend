import { Country } from '../../../domain/entities/country.entity';

export interface CountryRepository {
    findAll(): Promise<Country[]>;
    findById(id: string): Promise<Country | null>;
}
