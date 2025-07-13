import emailQueue from '../queues/email.queue';
import { sendEmail } from '../services/email.service';

interface EmailJobData {
  to: string;
  code: string;
}

emailQueue.process(async (job) => {
  const { to, code } = job.data as EmailJobData;

  console.log(`📧 Processing email job for ${to} with code ${code}`);

  try {
    await sendEmail({ to, code });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err; 
  }
});
