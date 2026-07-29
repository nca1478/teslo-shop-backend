import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

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

    private buildHtmlLayout(title: string, bodyHtml: string): string {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <span style="font-size:28px;">👕</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:4px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;letter-spacing:-0.5px;">
                      Teslo Shop
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="width:40px;height:3px;background-color:#3b82f6;border-radius:2px;margin:8px auto 0 auto;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="font-size:12px;color:#94a3b8;line-height:18px;">
                    <p style="margin:0 0 4px 0;">
                      Teslo Shop &mdash; Todos los derechos reservados
                    </p>
                    <p style="margin:0;">
                      Si no realizaste esta solicitud, ignora este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Unbranded disclaimer -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">
          <tr>
            <td align="center" style="padding:16px 16px 0 16px;font-size:11px;color:#94a3b8;line-height:16px;">
              Este es un mensaje automático de Teslo Shop. Por favor no respondas a este correo.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const bodyHtml = `
<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom:16px;">
      <h2 style="margin:0;font-size:18px;font-weight:600;color:#1a1a2e;">
        Restablece tu contrase&ntilde;a
      </h2>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:12px;font-size:14px;color:#475569;line-height:22px;">
      Recibiste este correo porque alguien solicit&oacute; restablecer la contrase&ntilde;a
      de la cuenta asociada a este email en <strong>Teslo Shop</strong>.
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:20px;font-size:14px;color:#475569;line-height:22px;">
      Utiliza el siguiente c&oacute;digo para continuar:
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:24px;">
      <table cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f5ff;border-radius:8px;border:1px solid #bfdbfe;">
        <tr>
          <td align="center" style="padding:16px 40px;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;font-family:Consolas,monospace;">
              ${otp}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#94a3b8;line-height:20px;">
      Este c&oacute;digo es v&aacute;lido por <strong>${OtpCode.EXPIRY_MINUTES} minutos</strong>.
      Si no solicitaste este cambio, puedes ignorar este mensaje y tu contrase&ntilde;a
      permanecer&aacute; segura.
    </td>
  </tr>
</table>`;

        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Código de recuperación de contraseña — Teslo Shop',
            text: `Tu código de verificación es: ${otp}\nVálido por ${OtpCode.EXPIRY_MINUTES} minutos.\n\nSi no solicitaste restablecer tu contraseña, ignora este mensaje.`,
            html: this.buildHtmlLayout(
                'Código de recuperación',
                bodyHtml,
            ),
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        const bodyHtml = `
<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom:16px;">
      <h2 style="margin:0;font-size:18px;font-weight:600;color:#1a1a2e;">
        Contrase&ntilde;a actualizada
      </h2>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:20px;font-size:14px;color:#475569;line-height:22px;">
      Te confirmamos que tu contrase&ntilde;a en <strong>Teslo Shop</strong>
      ha sido cambiada exitosamente.
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:24px;">
      <table cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
        <tr>
          <td align="center" style="padding:12px 32px;">
            <span style="font-size:16px;">✅</span>
            <span style="font-size:14px;font-weight:600;color:#16a34a;margin-left:6px;">
              Cambio exitoso
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#94a3b8;line-height:20px;">
      <strong>&iexcl;Importante!</strong> Si no realizaste este cambio,
      contacta a <strong>soporte@tesloshop.com</strong> de inmediato para
      proteger tu cuenta.
    </td>
  </tr>
</table>`;

        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Contraseña actualizada — Teslo Shop',
            text: 'Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte@tesloshop.com de inmediato.',
            html: this.buildHtmlLayout(
                'Contraseña actualizada',
                bodyHtml,
            ),
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }
}
