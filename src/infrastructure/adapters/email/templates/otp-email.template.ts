export function buildOtpEmailBody(otp: string, expiryMinutes: number): string {
    return `
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
      Este c&oacute;digo es v&aacute;lido por <strong>${expiryMinutes} minutos</strong>.
      Si no solicitaste este cambio, puedes ignorar este mensaje y tu contrase&ntilde;a
      permanecer&aacute; segura.
    </td>
  </tr>
</table>`;
}

export function buildOtpPlainText(otp: string, expiryMinutes: number): string {
    return `Tu código de verificación es: ${otp}
Válido por ${expiryMinutes} minutos.

Si no solicitaste restablecer tu contraseña, ignora este mensaje.`;
}
