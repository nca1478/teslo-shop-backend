import { Injectable } from '@nestjs/common';
import { CountryRepository } from '../../../application/ports/repositories/country.repository';
import { Country } from '../../../domain/entities/country.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaCountryRepository implements CountryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Country[]> {
    const countries = await this.prisma.country.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return countries.map((country) => ({
      id: country.id,
      name: country.name,
    }));
  }

  async findById(id: string): Promise<Country | null> {
    const country = await this.prisma.country.findUnique({
      where: { id },
    });

    if (!country) return null;

    return {
      id: country.id,
      name: country.name,
    };
  }
}
