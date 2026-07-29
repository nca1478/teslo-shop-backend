import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../ports/repositories/user.repository';
import type { EmailService } from '../../ports/services/email.service';
import { RequestOtpDto } from '../../dtos/auth/request-otp.dto';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

@Injectable()
export class RequestOtpUseCase {
    constructor(
        @Inject(INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(INJECTION_TOKENS.EMAIL_SERVICE)
        private readonly emailService: EmailService,
    ) {}

    async execute(dto: RequestOtpDto): Promise<{ ok: boolean; message?: string }> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) return { ok: false, message: 'Error al enviar el código OTP' };

        const otpCode = OtpCode.generate();
        const otpHash = await OtpCode.hash(otpCode);
        const otpExpiresAt = OtpCode.getExpiryDate();

        await this.userRepository.updateOtp(user.id, { otpHash, otpExpiresAt, otpAttempts: 0 });
        await this.emailService.sendOtpEmail(dto.email, otpCode);

        return { ok: true };
    }
}
