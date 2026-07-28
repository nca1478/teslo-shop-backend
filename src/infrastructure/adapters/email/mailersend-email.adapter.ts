import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

@Injectable()
export class MailerSendEmailAdapter implements EmailService {
    private readonly logger = new Logger(MailerSendEmailAdapter.name);
    private mailerSend: MailerSend;
    private fromEmail: string;
    private fromName: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('email.mailersendApiKey');
        const fromEmail = this.configService.get<string>('email.mailersendFromEmail');
        const fromName = this.configService.get<string>('email.mailersendFromName');

        if (!apiKey || !fromEmail) {
            throw new Error(
                'MailerSend configuration incomplete: MAILERSEND_API_KEY and MAILERSEND_FROM_EMAIL are required',
            );
        }

        this.mailerSend = new MailerSend({ apiKey });
        this.fromEmail = fromEmail;
        this.fromName = fromName ?? 'Teslo Shop';
    }

    private buildBaseParams(to: string): {
        sentFrom: Sender;
        recipients: Recipient[];
        replyTo: Recipient;
    } {
        const sentFrom = new Sender(this.fromEmail, this.fromName);
        const recipients = [new Recipient(to)];
        const replyTo = new Recipient(this.fromEmail, this.fromName);
        return { sentFrom, recipients, replyTo };
    }

    private addCommonSettings(params: EmailParams): EmailParams {
        return params
            .setSettings({ track_clicks: false, track_opens: true, track_content: false });
    }

    private async sendWithErrorHandling(emailParams: EmailParams): Promise<void> {
        try {
            await this.mailerSend.email.send(emailParams);
        } catch (error: unknown) {
            const mailerSendError = error as Record<string, unknown>;
            if (mailerSendError?.body) {
                const statusCode = String(mailerSendError.statusCode);
                const body = JSON.stringify(mailerSendError.body);
                this.logger.error(`MailerSend API error [${statusCode}]: ${body}`);
                throw new Error(`MailerSend API error [${statusCode}]: ${body}`);
            }
            const err = error as Error;
            throw new Error(err?.message || 'MailerSend email send failed');
        }
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const { sentFrom, recipients, replyTo } = this.buildBaseParams(to);

        const emailParams = this.addCommonSettings(
            new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setReplyTo(replyTo)
                .setSubject('Código de recuperación de contraseña')
                .setText(
                    `Tu código de verificación es: ${otp}\nVálido por ${OtpCode.EXPIRY_MINUTES} minutos.`,
                )
                .setHtml(
                    `<p>Tu código de verificación es: <strong>${otp}</strong></p><p>Válido por ${OtpCode.EXPIRY_MINUTES} minutos.</p>`,
                ),
        );

        await this.sendWithErrorHandling(emailParams);
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        const { sentFrom, recipients, replyTo } = this.buildBaseParams(to);

        const emailParams = this.addCommonSettings(
            new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setReplyTo(replyTo)
                .setSubject('Contraseña actualizada')
                .setText(
                    'Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte inmediatamente.',
                )
                .setHtml(
                    '<p>Tu contraseña ha sido cambiada exitosamente.</p><p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>',
                ),
        );

        await this.sendWithErrorHandling(emailParams);
    }
}
