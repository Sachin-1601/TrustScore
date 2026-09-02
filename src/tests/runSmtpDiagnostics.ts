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
  console.log(`  Secure (SSL/TLS):    ${diagnostic.secure ? "true (SSL/TLS)" : "false (STARTTLS)"}`);
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

  // Recipient resolution: from CLI arg or TEST_EMAIL_RECIPIENT environment variable
  const recipient = process.argv[2] || process.env.TEST_EMAIL_RECIPIENT;

  if (diagnostic.authSuccess) {
    if (recipient && recipient.includes("@")) {
      const sanitizedRecipient = recipient.trim();
      const domain = sanitizedRecipient.split("@")[1];
      console.log(`\n[4] Attempting Real Test Email Delivery to @${domain}...`);
      const sendResult = await SmtpDiagnosticService.sendTestEmail(sanitizedRecipient);
      if (sendResult.success) {
        console.log("  ✅ Test email ACCEPTED by SMTP server!");
        console.log(`  Message ID: ${sendResult.messageId}`);
      } else {
        console.log("  ❌ Test email failed delivery!");
        console.log(`  Error: ${sendResult.error}`);
        console.log(`  Code: ${sendResult.errorCode || "N/A"}`);
      }
    } else {
      console.log("\n[4] Test Email Delivery: Skipped");
      console.log("  To send a live test email, run:");
      console.log("  npx tsx src/tests/runSmtpDiagnostics.ts your-email@example.com");
      console.log("  OR: TEST_EMAIL_RECIPIENT=your-email@example.com npx tsx src/tests/runSmtpDiagnostics.ts");
    }
  } else {
    console.log("\n[4] Test Email Delivery: Skipped (SMTP credentials not configured or authentication failed)");
  }

  console.log("\n==================================================");
}

main().catch(console.error);
