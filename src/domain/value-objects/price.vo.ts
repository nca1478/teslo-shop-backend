import { ValidationDomainException } from '../exceptions/domain.exception';

export class Price {
    private readonly value: number;

    constructor(price: number) {
        if (!this.isValid(price)) {
            throw new ValidationDomainException('Price must be a positive number');
        }
        this.value = Math.round(price * 100) / 100; // Round to 2 decimal places
    }

    getValue(): number {
        return this.value;
    }

    private isValid(price: number): boolean {
        return typeof price === 'number' && price >= 0 && !isNaN(price);
    }

    add(other: Price): Price {
        return new Price(this.value + other.value);
    }

    multiply(factor: number): Price {
        return new Price(this.value * factor);
    }

    equals(other: Price): boolean {
        return this.value === other.value;
    }
}
