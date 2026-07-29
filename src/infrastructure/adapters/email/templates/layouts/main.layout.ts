export function buildMainLayout(title: string, bodyHtml: string): string {
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
