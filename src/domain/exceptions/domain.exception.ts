export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundDomainException';
  }
}

export class ValidationDomainException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationDomainException';
  }
}
