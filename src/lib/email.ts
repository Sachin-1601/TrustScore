import nodemailer from "nodemailer";

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  verificationUrl: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string | number;
  missingConfig?: string[];
}

/**
 * Production Email Service for TrustScore.
 * Handles transactional delivery using SMTP / configured transport.
 * Never logs credentials, passwords, or verification tokens.
 */
export class EmailService {
  public static isConfigured(): boolean {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    return Boolean(host && user && pass);
  }

  public static getMissingConfig(): string[] {
    const missing: string[] = [];
    if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
    if (!process.env.SMTP_PORT?.trim()) missing.push("SMTP_PORT");
    if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
    if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
    if (!process.env.EMAIL_FROM?.trim()) missing.push("EMAIL_FROM");
    if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) missing.push("NEXT_PUBLIC_APP_URL");
    return missing;
  }

  private static getTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  public static getFromAddress(): string {
    const configuredFrom = process.env.EMAIL_FROM?.trim();
    const user = process.env.SMTP_USER?.trim();
    const host = process.env.SMTP_HOST?.trim();

    // If using Gmail SMTP and EMAIL_FROM is generic, Gmail requires sender identity to match account
    if (host?.includes("gmail.com") && user) {
      if (!configuredFrom || configuredFrom.includes("no-reply@trustscore.io")) {
        return `TrustScore <${user}>`;
      }
    }

    return configuredFrom || "TrustScore <no-reply@trustscore.io>";
  }

  public static getAppUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  }

  public static async sendVerificationEmail({
    to,
    name,
    verificationUrl,
  }: SendVerificationEmailParams): Promise<EmailDeliveryResult> {
    const cleanEmail = to.trim().toLowerCase();
    const toDomain = cleanEmail.split("@")[1] || "unknown";

    // 1. Check if SMTP transport is configured
    const transporter = this.getTransporter();

    if (!transporter) {
      const missing = this.getMissingConfig();
      console.warn(
        `[EmailService] SMTP delivery unavailable — Missing credentials: ${missing.join(", ")}`
      );

      return {
        success: false,
        error: "Email delivery service is not configured.",
        errorCode: "SMTP_NOT_CONFIGURED",
        missingConfig: missing,
      };
    }

    const from = this.getFromAddress();
    const cleanName = name.trim() || "there";
    const subject = "Verify your TrustScore account";

    const textBody = `Hi ${cleanName},

Thanks for joining TrustScore.

Please verify your email address to activate your account by clicking the link below:
${verificationUrl}

This verification link expires in 30 minutes.

If you did not create this account, you can safely ignore this email.

— The TrustScore Team
https://trustscore.io`;

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your TrustScore account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1e293b;">
              <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                TRUST<span style="color: #3b82f6;">SCORE</span>
              </div>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding-top: 28px; padding-bottom: 24px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                Verify your email address
              </h1>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                Hi ${cleanName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #cbd5e1;">
                Thanks for joining TrustScore. Please verify your email address to activate your account and access your workspace.
              </p>
              
              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 14px; background-color: #2563eb;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 14px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 18px; color: #64748b;">
                This verification link expires in <strong>30 minutes</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 18px; color: #64748b;">
                If you did not create a TrustScore account, you can safely ignore this email.
              </p>
              
              <div style="padding: 16px; background-color: #090d16; border: 1px solid #1e293b; border-radius: 12px; font-size: 11px; color: #64748b; word-break: break-all;">
                Or copy and paste this verification URL into your browser:<br>
                <a href="${verificationUrl}" style="color: #3b82f6; text-decoration: none;">${verificationUrl}</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; text-align: center;">
              © 2026 TrustScore Technologies. Authenticity Intelligence &amp; Marketplace.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      console.log(`[EmailService] Attempting SMTP delivery to recipient domain: ${toDomain}`);

      const info = await transporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[EmailService] SMTP delivery ACCEPTED: messageId=${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const errorCode = err.code || err.responseCode || "UNKNOWN";
      console.error(`[EmailService] SMTP delivery FAILED (Code: ${errorCode}):`, err.message);
      return {
        success: false,
        error: err.message || "SMTP transmission error",
        errorCode,
      };
    }
  }
}
