import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';
import { buildMainLayout } from './templates/layouts/main.layout';
import { buildOtpEmailBody, buildOtpPlainText } from './templates/otp-email.template';
import {
    buildPasswordChangedBody,
    buildPasswordChangedPlainText,
} from './templates/password-changed.template';

@Injectable()
export class ResendEmailAdapter implements EmailService {
    private readonly logger = new Logger(ResendEmailAdapter.name);
    private resend: Resend;
    private fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('email.resendApiKey');
        const fromEmail = this.configService.get<string>('email.resendFromEmail');

        if (!apiKey) {
            throw new Error(
                'Resend configuration incomplete: RESEND_API_KEY is required',
            );
        }

        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail ?? 'Teslo Shop <noreply@teslohop.com>';
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Código de recuperación de contraseña — Teslo Shop',
            text: buildOtpPlainText(otp, OtpCode.EXPIRY_MINUTES),
            html: buildMainLayout(
                'Código de recuperación',
                buildOtpEmailBody(otp, OtpCode.EXPIRY_MINUTES),
            ),
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Contraseña actualizada — Teslo Shop',
            text: buildPasswordChangedPlainText(),
            html: buildMainLayout(
                'Contraseña actualizada',
                buildPasswordChangedBody(),
            ),
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }
}
