import Bull from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const emailQueue = new Bull('emailQueue', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

export default emailQueue;
