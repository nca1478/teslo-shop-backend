import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../ports/repositories/user.repository';
import { VerifyOtpDto } from '../../dtos/auth/verify-otp.dto';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class VerifyOtpUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(dto: VerifyOtpDto): Promise<{ verified: boolean }> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user || !user.otpHash) {
            throw new ValidationDomainException('Código inválido o expirado');
        }

        if (!user.otpExpiresAt || OtpCode.isExpired(user.otpExpiresAt)) {
            await this.userRepository.clearOtp(user.id);
            throw new ValidationDomainException('Código expirado. Solicita uno nuevo');
        }

        if ((user.otpAttempts ?? 0) >= OtpCode.MAX_ATTEMPTS) {
            await this.userRepository.clearOtp(user.id);
            throw new ValidationDomainException('Demasiados intentos. Solicita un nuevo código');
        }

        const isValid = await OtpCode.verify(dto.otp, user.otpHash);
        if (!isValid) {
            await this.userRepository.updateOtp(user.id, {
                otpHash: user.otpHash,
                otpExpiresAt: user.otpExpiresAt,
                otpAttempts: (user.otpAttempts ?? 0) + 1,
            });
            throw new ValidationDomainException('Código inválido');
        }

        return { verified: true };
    }
}
