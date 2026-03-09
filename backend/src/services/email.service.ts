import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

interface SendQuotationEmailParams {
  to: string;
  companyName: string;
  quotationId: number;
  pdfBuffer: Buffer;
}

export const sendQuotationEmail = async ({ to, companyName, quotationId, pdfBuffer }: SendQuotationEmailParams) => {
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: `Quotation #${quotationId} from ${companyName}`,
    text: `Hello,\n\nPlease find attached quotation #${quotationId} from ${companyName}.\n\nBest regards,\n${companyName}`,
    attachments: [
      {
        filename: `quotation-${quotationId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};
