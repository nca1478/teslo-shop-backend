import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../ports/repositories/user.repository';
import type { AuthService } from '../../ports/services/auth.service';
import type { EmailService } from '../../ports/services/email.service';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';
import { ValidationDomainException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(INJECTION_TOKENS.AUTH_SERVICE)
        private readonly authService: AuthService,
        @Inject(INJECTION_TOKENS.EMAIL_SERVICE)
        private readonly emailService: EmailService,
    ) {}

    async execute(dto: ResetPasswordDto): Promise<{ ok: boolean }> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user || !user.otpHash) {
            throw new ValidationDomainException('Código inválido o expirado');
        }

        if (!user.otpExpiresAt || OtpCode.isExpired(user.otpExpiresAt)) {
            await this.userRepository.clearOtp(user.id);
            throw new ValidationDomainException('Código expirado. Solicita uno nuevo');
        }

        const isValid = await OtpCode.verify(dto.otp, user.otpHash);
        if (!isValid) {
            throw new ValidationDomainException('Código inválido');
        }

        const hashedPassword = await this.authService.hashPassword(dto.password);
        await this.userRepository.update(user.id, { password: hashedPassword });
        await this.userRepository.clearOtp(user.id);
        await this.emailService.sendPasswordChangedEmail(dto.email);

        return { ok: true };
    }
}
