export function buildPasswordChangedBody(): string {
    return `
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
}

export function buildPasswordChangedPlainText(): string {
    return `Tu contraseña ha sido cambiada exitosamente.
Si no realizaste este cambio, contacta a soporte@tesloshop.com de inmediato.`;
}
