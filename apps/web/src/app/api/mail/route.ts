import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { toEmail, subject, htmlContent, secret } = await req.json();

    // Verify internal secret to prevent unauthorized spam calls
    const internalSecret = process.env.INTERNAL_MAIL_SECRET || 'firstmile-internal-mail-secret-key-2026';
    if (secret !== internalSecret) {
      return NextResponse.json({ error: 'Unauthorized mail request' }, { status: 401 });
    }

    if (!toEmail || !htmlContent) {
      return NextResponse.json({ error: 'toEmail and htmlContent are required' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || 'noreplyfirstmilee@gmail.com';
    const pass = process.env.SMTP_PASS || 'fywd jrbb khqu zdbr';
    const fromAddress = process.env.EMAIL_FROM || '"FIRST MILE" <noreplyfirstmilee@gmail.com>';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: subject || 'Your FIRST MILE Verification Code',
      html: htmlContent,
    });

    console.log(`[VERCEL MAIL DISPATCHER] Successfully delivered email to ${toEmail} via Gmail SMTP`);

    return NextResponse.json({ success: true, message: `Email dispatched to ${toEmail}` });
  } catch (error: any) {
    console.error('[VERCEL MAIL DISPATCHER ERROR]:', error.message || error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}
