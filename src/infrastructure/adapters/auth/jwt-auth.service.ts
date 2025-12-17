import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../../application/ports/services/auth.service';

@Injectable()
export class JwtAuthService implements AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateJwtToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  verifyJwtToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
