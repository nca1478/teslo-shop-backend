import { ValidationDomainException } from '../exceptions/domain.exception';

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!this.isValid(password)) {
      throw new ValidationDomainException(
        'Password must be at least 6 characters long',
      );
    }
    this.value = password;
  }

  getValue(): string {
    return this.value;
  }

  private isValid(password: string): boolean {
    return Boolean(password && password.length >= 6);
  }
}
