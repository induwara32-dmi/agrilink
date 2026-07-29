import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private readonly transporter: Transporter;

  public constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
    });
  }

  public async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/auth/email-verification-success?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verify your AgriLink email',
      text: `Verify your AgriLink email address: ${verificationUrl}`,
      html: `<p>Verify your AgriLink email address:</p><p><a href="${verificationUrl}">Verify email</a></p>`,
    });
  }

  public async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset your AgriLink password',
      text: `Reset your AgriLink password: ${resetUrl}`,
      html: `<p>A password reset was requested for your account.</p><p><a href="${resetUrl}">Reset password</a></p>`,
    });
  }

  public async sendNotification(email: string, subject: string, body: string): Promise<void> {
    const escaped = body.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    await this.transporter.sendMail({ from: env.SMTP_FROM, to: email, subject, text: body, html: `<p>${escaped}</p>` });
  }
}
