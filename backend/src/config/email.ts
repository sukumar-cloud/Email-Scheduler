import * as nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
let etherealAccount: { user: string; pass: string } | null = null;

export async function getMailTransporter() {
    if (transporter) {
        return { transporter, account: etherealAccount };
    }

    // Check if SMTP credentials are provided in env
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        etherealAccount = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        };
    } else {
        // Generate test account from Ethereal
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        etherealAccount = {
            user: testAccount.user,
            pass: testAccount.pass,
        };
        console.log('📧 Ethereal Email Account Created:');
        console.log('   User:', testAccount.user);
        console.log('   Pass:', testAccount.pass);
        console.log('   Preview URL: https://ethereal.email');
    }

    return { transporter, account: etherealAccount };
}
