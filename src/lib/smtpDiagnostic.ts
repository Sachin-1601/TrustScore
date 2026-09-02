import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export interface EnvStatus {
  SMTP_HOST: "configured" | "missing";
  SMTP_PORT: "configured" | "missing";
  SMTP_USER: "configured" | "missing";
  SMTP_PASS: "configured" | "missing";
  EMAIL_FROM: "configured" | "missing";
  NEXT_PUBLIC_APP_URL: "configured" | "missing";
}

export interface DiagnosticResult {
  envStatus: EnvStatus;
  isConfigured: boolean;
  provider: string;
  host: string;
  port: number;
  secure: boolean;
  connectionSuccess: boolean;
  authSuccess: boolean;
  error?: string;
  errorCode?: string | number;
  errorReason?: string;
  notes: string[];
}

/**
 * Parses .env safely from disk without exposing secret values.
 */
export function loadEnvConfigSafely(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env");
  const config: Record<string, string> = {};

  if (!fs.existsSync(envPath)) {
    return config;
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      config[key] = val;
    }
  }

  return config;
}

export class SmtpDiagnosticService {
  public static getEnvStatus(): EnvStatus {
    const env = loadEnvConfigSafely();
    return {
      SMTP_HOST: env.SMTP_HOST && env.SMTP_HOST.trim() ? "configured" : "missing",
      SMTP_PORT: env.SMTP_PORT && env.SMTP_PORT.trim() ? "configured" : "missing",
      SMTP_USER: env.SMTP_USER && env.SMTP_USER.trim() ? "configured" : "missing",
      SMTP_PASS: env.SMTP_PASS && env.SMTP_PASS.trim() ? "configured" : "missing",
      EMAIL_FROM: env.EMAIL_FROM && env.EMAIL_FROM.trim() ? "configured" : "missing",
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL && env.NEXT_PUBLIC_APP_URL.trim() ? "configured" : "missing",
    };
  }

  public static async runDiagnostics(): Promise<DiagnosticResult> {
    const env = loadEnvConfigSafely();
    const envStatus = this.getEnvStatus();
    const isConfigured = Boolean(
      env.SMTP_HOST?.trim() &&
      env.SMTP_USER?.trim() &&
      env.SMTP_PASS?.trim()
    );

    const host = env.SMTP_HOST?.trim() || "not_configured";
    const port = parseInt(env.SMTP_PORT || "587", 10);
    const secure = port === 465;
    const user = env.SMTP_USER?.trim() || "";
    const pass = env.SMTP_PASS?.trim() || "";
    const from = env.EMAIL_FROM?.trim() || "";

    const notes: string[] = [];

    // Identify provider
    let provider = "Custom SMTP";
    if (host.includes("gmail.com")) {
      provider = "Google Gmail SMTP";
      notes.push("Gmail SMTP detected (smtp.gmail.com).");
      notes.push("Gmail requires 2-Step Verification and a 16-character Gmail App Password (not standard account password).");
      if (from && !from.includes(user) && !from.includes("@gmail.com")) {
        notes.push(`Notice: EMAIL_FROM is "${from}" but SMTP user is a Gmail account. Gmail may rewrite or reject non-matching sender headers.`);
      }
    } else if (host.includes("sendgrid")) {
      provider = "Twilio SendGrid SMTP";
    } else if (host.includes("mailgun")) {
      provider = "Mailgun SMTP";
    } else if (host.includes("resend")) {
      provider = "Resend SMTP";
    }

    if (!isConfigured) {
      return {
        envStatus,
        isConfigured: false,
        provider,
        host,
        port,
        secure,
        connectionSuccess: false,
        authSuccess: false,
        error: "SMTP environment variables are incomplete or empty in .env.",
        errorReason: "Missing required SMTP credentials (SMTP_HOST, SMTP_USER, or SMTP_PASS).",
        notes,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      // Verify connection & credentials without sending email
      await transporter.verify();

      return {
        envStatus,
        isConfigured: true,
        provider,
        host,
        port,
        secure,
        connectionSuccess: true,
        authSuccess: true,
        notes,
      };
    } catch (err: any) {
      const errorCode = err.code || err.responseCode || "UNKNOWN";
      let errorReason = err.message || "Unknown SMTP error";

      if (errorCode === "EAUTH" || err.responseCode === 535) {
        errorReason = "Authentication failed: Invalid SMTP username or password. If using Gmail, ensure you are using a 16-character App Password.";
      } else if (errorCode === "ETIMEDOUT" || errorCode === "ECONNREFUSED") {
        errorReason = `Connection failed: Could not reach SMTP server at ${host}:${port}. Check firewall or port configuration.`;
      } else if (errorCode === "ESOCKET") {
        errorReason = `TLS/SSL handshake failed on ${host}:${port}. Try port 587 (secure: false) or 465 (secure: true).`;
      }

      return {
        envStatus,
        isConfigured: true,
        provider,
        host,
        port,
        secure,
        connectionSuccess: false,
        authSuccess: false,
        error: err.message,
        errorCode,
        errorReason,
        notes,
      };
    }
  }

  public static async sendTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string; errorCode?: string | number }> {
    const env = loadEnvConfigSafely();
    const host = env.SMTP_HOST?.trim();
    const port = parseInt(env.SMTP_PORT || "587", 10);
    const user = env.SMTP_USER?.trim();
    const pass = env.SMTP_PASS?.trim();
    const from = env.EMAIL_FROM?.trim() || (user ? `TrustScore <${user}>` : "TrustScore <no-reply@trustscore.io>");

    if (!host || !user || !pass) {
      return {
        success: false,
        error: "Cannot send test email: SMTP credentials are not configured in .env.",
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: "TrustScore Email Delivery Test",
        text: `This is a TrustScore email delivery test sent to ${toEmail}.

If this message arrives in your inbox, SMTP delivery is operational.

Timestamp: ${new Date().toISOString()}
Provider: ${host}`,
        html: `<div style="font-family: sans-serif; padding: 20px; background: #090d16; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #3b82f6;">TrustScore Email Delivery Test</h2>
          <p>This is a TrustScore email delivery test sent to <strong>${toEmail}</strong>.</p>
          <p>If this message arrives in your inbox, SMTP delivery is operational.</p>
          <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
          <small style="color: #94a3b8;">Timestamp: ${new Date().toISOString()}<br>Host: ${host}</small>
        </div>`,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        errorCode: err.code || err.responseCode,
      };
    }
  }
}
