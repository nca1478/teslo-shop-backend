import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCountriesUseCase } from '../../application/use-cases/countries/get-countries.use-case';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly getCountriesUseCase: GetCountriesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'Countries retrieved successfully' })
  async getCountries() {
    return this.getCountriesUseCase.execute();
  }
}
