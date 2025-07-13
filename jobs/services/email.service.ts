import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export interface SendEmailInput {
  to: string;
  code: string;
}

export const sendEmail = async ({ to, code }: SendEmailInput): Promise<void> => {
  const mailOptions = {
    from: '"Voucher App" <no-reply@voucherapp.com>',
    to,
    subject: '🎟️ Your voucher code has arrived!',
    html: `
      <h3>Congratulations!</h3>
      <p>You have received a voucher code:</p>
      <h2>${code}</h2>
      <p>Use it before it expires.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
