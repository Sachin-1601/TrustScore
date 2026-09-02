import { SmtpDiagnosticService } from "../lib/smtpDiagnostic";

async function main() {
  console.log("==================================================");
  console.log("🔍 TRUSTSCORE SMTP DIAGNOSTICS & DELIVERY CHECK");
  console.log("==================================================");

  const envStatus = SmtpDiagnosticService.getEnvStatus();
  console.log("\n[1] Environment Variables Inspection:");
  console.log(`  SMTP_HOST:           ${envStatus.SMTP_HOST}`);
  console.log(`  SMTP_PORT:           ${envStatus.SMTP_PORT}`);
  console.log(`  SMTP_USER:           ${envStatus.SMTP_USER}`);
  console.log(`  SMTP_PASS:           ${envStatus.SMTP_PASS}`);
  console.log(`  EMAIL_FROM:          ${envStatus.EMAIL_FROM}`);
  console.log(`  NEXT_PUBLIC_APP_URL: ${envStatus.NEXT_PUBLIC_APP_URL}`);

  console.log("\n[2] Running SMTP Connection & Handshake Diagnostics...");
  const diagnostic = await SmtpDiagnosticService.runDiagnostics();

  console.log(`  Provider:            ${diagnostic.provider}`);
  console.log(`  Host:                ${diagnostic.host}`);
  console.log(`  Port:                ${diagnostic.port}`);
  console.log(`  Secure (SSL/TLS):    ${diagnostic.secure}`);
  console.log(`  TCP Connection:      ${diagnostic.connectionSuccess ? "SUCCESS ✅" : "FAILED ❌"}`);
  console.log(`  Authentication:      ${diagnostic.authSuccess ? "SUCCESS ✅" : "FAILED ❌"}`);

  if (diagnostic.error) {
    console.log(`\n  Diagnostic Error:    ${diagnostic.error}`);
    console.log(`  Error Code:          ${diagnostic.errorCode || "N/A"}`);
    console.log(`  Root Reason:         ${diagnostic.errorReason || "N/A"}`);
  }

  if (diagnostic.notes.length > 0) {
    console.log("\n[3] Provider Analysis Notes:");
    diagnostic.notes.forEach((note) => console.log(`  • ${note}`));
  }

  // If credentials are configured, attempt delivery of a real test email to sachinboddhulx@gmail.com
  if (diagnostic.authSuccess) {
    console.log("\n[4] Attempting Real Test Email Delivery to sachinboddhulx@gmail.com...");
    const sendResult = await SmtpDiagnosticService.sendTestEmail("sachinboddhulx@gmail.com");
    if (sendResult.success) {
      console.log("  ✅ Test email accepted by SMTP server!");
      console.log(`  Message ID: ${sendResult.messageId}`);
    } else {
      console.log("  ❌ Test email failed delivery!");
      console.log(`  Error: ${sendResult.error}`);
      console.log(`  Code: ${sendResult.errorCode || "N/A"}`);
    }
  } else {
    console.log("\n[4] Test Email Delivery: Skipped (SMTP credentials not configured or handshake failed)");
  }

  console.log("\n==================================================");
}

main().catch(console.error);
