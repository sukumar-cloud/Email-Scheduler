import { Email } from '../../domain/entities/Email';
import { getMailTransporter } from '../../config/email';
import nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize() {
    const { transporter } = await getMailTransporter();
    this.transporter = transporter;
  }

  async send(email: Email): Promise<string> {
    if (!this.transporter) {
      await this.initialize();
    }

    const info = await this.transporter!.sendMail({
      from: email.sender,
      to: email.recipient,
      subject: email.subject,
      text: email.body,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${email.body.replace(/\n/g, '<br>')}</div>`,
    });

    console.log('📧 Email sent:', info.messageId);
    console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));

    return info.messageId;
  }
}
