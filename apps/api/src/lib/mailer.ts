import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';
import axios from 'axios';

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

    // Live MX DNS lookup
    try {
      const records = await resolveMx(domain);
      if (!records || records.length === 0) {
        return { valid: false, error: `The email domain '@${domain}' does not have valid mail exchange (MX) servers.` };
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

// 2. Send HTML Verification Email (Supports Resend HTTPS API, Nodemailer SMTP, and fallback)
export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string
): Promise<{ success: boolean; previewUrl?: string; error?: string; devOtp?: string }> {
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"FIRST MILE" <noreply@firstmile.dev>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background-color: #080808; border: 1px solid #222222; border-radius: 12px; padding: 40px; }
        .logo { font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #1a1a1a; padding-bottom: 16px; }
        .title { font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .desc { font-size: 13px; color: #888888; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { background-color: #121212; border: 1px solid #333333; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 28px; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #ffffff; margin: 0; }
        .footer { font-size: 11px; color: #555555; text-align: center; border-top: 1px solid #1a1a1a; padding-top: 20px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">FIRST MILE</div>
        <div class="title">Verify Your Identity</div>
        <div class="desc">
          Enter this verification code in your FIRST MILE portal window to complete your authentication. This code is valid for 10 minutes.
        </div>
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
        </div>
        <div class="desc" style="font-size: 12px; color: #666666;">
          If you did not request this login or registration, you can safely ignore this email.
        </div>
        <div class="footer">
          FIRST MILE &bull; Where careers begin.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. If Resend HTTPS API Key is provided (Recommended for Render, AWS, Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.EMAIL_FROM || 'FIRST MILE <onboarding@resend.dev>',
          to: [toEmail],
          subject: `Your FIRST MILE Verification Code: ${otpCode}`,
          html: htmlContent,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      console.log(`[FIRST MILE] 🚀 REAL EMAIL SENT VIA RESEND HTTPS API to: ${toEmail}`);
      return { success: true };
    } catch (resendErr: any) {
      console.error('[FIRST MILE] Resend HTTPS dispatch failed:', resendErr.response?.data || resendErr.message);
    }
  }

  // 2. Try Nodemailer SMTP with short timeout (to prevent hanging if Render blocks port 587)
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 4000,
      });

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Your FIRST MILE Verification Code: ${otpCode}`,
        text: `Your FIRST MILE verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: htmlContent,
      });

      console.log(`[FIRST MILE] 🚀 REAL EMAIL SENT VIA SMTP to: ${toEmail}`);
      return { success: true };
    } catch (smtpErr: any) {
      console.warn(`[FIRST MILE] SMTP connection timed out or failed (likely cloud port block):`, smtpErr.message);
    }
  }

  // 3. Fallback: Log OTP in terminal & return code so user is NEVER blocked
  console.log(`\n================================================================`);
  console.log(`[FIRST MILE] 🔑 ACTIVE OTP CODE FOR ${toEmail}: ${otpCode}`);
  console.log(`================================================================\n`);

  return { success: false, devOtp: otpCode };
}
