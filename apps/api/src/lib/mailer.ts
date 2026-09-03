import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// 1. Validate that the email domain actually has active MX records (can receive mail)
export async function validateEmailDomain(email: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { valid: false, error: 'Invalid email address format' };
    }

    const domain = parts[1];

    // Common disposable / invalid test domain check
    const blockedDomains = ['example.com', 'test.com', 'fake.com', 'invalid.com'];
    if (blockedDomains.includes(domain)) {
      return { valid: false, error: `The domain '${domain}' is a test domain and cannot receive real emails.` };
    }

    // DNS MX Lookup
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, error: `The domain '@${domain}' does not have active mail servers (MX records).` };
      }
    } catch (dnsErr: any) {
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
        return { valid: false, error: `The email domain '@${domain}' does not exist or cannot receive mail.` };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: true };
  }
}

// 2. Initialize Nodemailer Transporter
async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; isRealSmtp: boolean }> {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return { transporter, isRealSmtp: true };
  }

  // Fallback to auto-created Ethereal test inbox for development
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, isRealSmtp: false };
}

// 3. Send HTML Verification Email
export async function sendVerificationEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const { transporter, isRealSmtp } = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"FIRST MILE" <noreply@firstmile.dev>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 24px; margin: 0; }
          .container { max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #242424; border-radius: 8px; padding: 36px; }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
          .subtitle { font-size: 11px; color: #888888; margin-top: 4px; font-family: monospace; }
          .otp-card { background: #000000; border: 1px solid #333333; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; font-family: monospace; margin: 0; }
          .otp-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666666; margin-bottom: 6px; font-weight: 700; }
          .footer { font-size: 10px; color: #555555; text-align: center; margin-top: 28px; border-top: 1px solid #1a1a1a; padding-top: 16px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">FIRST MILE</h1>
            <p class="subtitle">WHERE CAREERS BEGIN</p>
          </div>
          <p style="font-size: 13px; color: #b5b5b5; line-height: 1.6;">
            Hello,<br/><br/>
            Your one-time authentication code is below. Enter this code on FIRST MILE to access your workspace.
          </p>
          <div class="otp-card">
            <div class="otp-label">Verification Code</div>
            <div class="otp-code">${otpCode}</div>
          </div>
          <p style="font-size: 11px; color: #666666; text-align: center;">
            This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
          </p>
          <div class="footer">
            © ${new Date().getFullYear()} FIRST MILE • Technical Career & Placement Platform
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your FIRST MILE Verification Code: ${otpCode}`,
      text: `Your FIRST MILE verification code is: ${otpCode}. It expires in 10 minutes.`,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    if (isRealSmtp) {
      console.log(`\n================================================================`);
      console.log(`[FIRST MILE] 🚀 REAL EMAIL SENT VIA SMTP to: ${toEmail}`);
      console.log(`[FIRST MILE] Check your inbox or spam folder!`);
      console.log(`================================================================\n`);
    } else {
      console.log(`\n================================================================`);
      console.log(`[FIRST MILE] ⚠️ REAL EMAIL NOT DISPATCHED (SMTP NOT YET CONFIGURED IN .env)`);
      console.log(`[FIRST MILE] 🔑 YOUR VERIFICATION OTP CODE IS: ${otpCode}`);
      if (previewUrl) {
        console.log(`[FIRST MILE] 🔗 Instant Web Inbox Preview: ${previewUrl}`);
      }
      console.log(`================================================================\n`);
    }

    return { success: true, previewUrl: previewUrl ? String(previewUrl) : undefined };
  } catch (err: any) {
    console.error('\n================================================================');
    console.error('[FIRST MILE] ❌ EMAIL SENDING FAILED (SMTP Authentication Error):', err.message || err);
    console.error(`[FIRST MILE] 🔑 YOUR ACTIVE OTP VERIFICATION CODE IS: ${otpCode}`);
    console.error('================================================================\n');
    return { success: false, error: err.message };
  }
}
