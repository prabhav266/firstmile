import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';
import axios from 'axios';

const resolveMx = promisify(dns.resolveMx);

const COMMON_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmai.co': 'gmail.com',
  'gmaill.co': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaill.in': 'gmail.com',
  'gmai.in': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlok.co': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.con': 'hotmail.com',
};

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'dispostable.com', 'trashmail.com',
  'getairmail.com', 'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com',
  'tempail.com', 'generator.email', 'mohmal.com', 'inboxkitten.com',
  'crazymailing.com', 'mytemp.email', 'trashmail.net', 'burnermail.io',
  'example.com', 'test.com', 'fake.com', 'invalid.com',
]);

// 1. Validate that the email domain actually has active MX records (can receive mail)
export async function validateEmailDomain(email: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const trimmed = email.trim().toLowerCase();
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { valid: false, error: 'Invalid email address format' };
    }

    // RFC regex check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed) || trimmed.includes('..')) {
      return { valid: false, error: 'Invalid email address format' };
    }

    const domain = parts[1];

    // Typo detection
    if (COMMON_TYPOS[domain]) {
      return {
        valid: false,
        error: `Did you mean @${COMMON_TYPOS[domain]}? Please check the spelling of your email address.`,
      };
    }

    // Disposable domain check
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return {
        valid: false,
        error: 'Temporary or disposable email domains are not allowed. Please enter your real email.',
      };
    }

    // Live MX DNS lookup with strict 2.5 second timeout to prevent hanging
    try {
      const dnsTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
      );

      const records = (await Promise.race([resolveMx(domain), dnsTimeout])) as any[];
      if (!records || records.length === 0) {
        return {
          valid: false,
          error: `The email domain '@${domain}' does not have mail servers. Please enter a valid email.`,
        };
      }
    } catch (dnsErr: any) {
      return {
        valid: false,
        error: `The email domain '@${domain}' does not exist or cannot receive mail. Please enter a valid email address.`,
      };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Failed to validate email address. Please check and try again.' };
  }
}

// 2. Send HTML Verification Email
export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string
): Promise<{ success: boolean; previewUrl?: string; error?: string; devOtp?: string }> {
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"FIRST MILE" <noreplyfirstmilee@gmail.com>';

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

  // 1. Primary Cloud Route: Dispatch via Vercel HTTPS Gateway (Bypasses Render port blocks 100%)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (frontendUrl && !frontendUrl.includes('localhost')) {
    try {
      const mailEndpoint = `${frontendUrl.replace(/\/$/, '')}/api/mail`;
      await axios.post(
        mailEndpoint,
        {
          toEmail,
          subject: `Your FIRST MILE Verification Code: ${otpCode}`,
          htmlContent,
          secret: 'firstmile-internal-mail-secret-key-2026',
        },
        { timeout: 10000 }
      );
      console.log(`[FIRST MILE] 🚀 REAL EMAIL SENT VIA VERCEL HTTPS GATEWAY to: ${toEmail}`);
      return { success: true };
    } catch (gatewayErr: any) {
      console.warn(`[FIRST MILE] Vercel mail gateway dispatch failed:`, gatewayErr.response?.data || gatewayErr.message);
    }
  }

  // 2. Secondary Cloud Route: If Resend HTTPS API Key is provided
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

  // 3. Direct Nodemailer SMTP (Works in local dev or unblocked servers)
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

      console.log(`[FIRST MILE] 🚀 REAL EMAIL SENT VIA DIRECT SMTP to: ${toEmail}`);
      return { success: true };
    } catch (smtpErr: any) {
      console.warn(`[FIRST MILE] Direct SMTP connection failed (Render free tier blocks port 587):`, smtpErr.message);
    }
  }

  // 4. Fallback: Log OTP in terminal & return code so user is NEVER blocked
  console.log(`\n================================================================`);
  console.log(`[FIRST MILE] 🔑 ACTIVE OTP CODE FOR ${toEmail}: ${otpCode}`);
  console.log(`================================================================\n`);

  return { success: false, devOtp: otpCode };
}
