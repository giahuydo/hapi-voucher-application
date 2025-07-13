import mongoose from 'mongoose';
import Event from '../models/event.model';
import Voucher from '../models/voucher.model';
import emailQueue from '../../jobs/queues/email.queue';

interface IssueVoucherInput {
  eventId: string;
  userId: string;
}

interface VoucherResponse {
  success: boolean;
  message: string;
  code: number;
  data?: {
    code: string;
  };
}

export const issueVoucher = async ({
  eventId,
  userId
}: IssueVoucherInput): Promise<VoucherResponse> => {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const event = await Event.findById(eventId).session(session);
      if (!event || event.issuedCount >= event.maxQuantity) {
        await session.abortTransaction();
        return {
          success: false,
          message: '🎟️ Voucher has been exhausted.',
          code: 456
        };
      }

      const code = `VC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      await Voucher.create(
        [{
          eventId,
          issuedTo: userId,
          code
        }],
        { session }
      );

      event.issuedCount += 1;
      await event.save({ session });

      await session.commitTransaction();

      // Push to email queue after commit
      await emailQueue.add({ to: userId, code });

      return {
        success: true,
        message: '✅ Voucher issued successfully.',
        code: 200,
        data: { code }
      };
    } catch (err: any) {
      await session.abortTransaction();

      const isRetryable = err.hasErrorLabel?.('TransientTransactionError');
      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`⚠️ Retry transaction (attempt ${attempt}): ${err.message}`);
        continue;
      }

      console.error('❌ Transaction failed:', err);
      return {
        success: false,
        message: 'Internal server error.',
        code: 500
      };
    } finally {
      session.endSession();
    }
  }

  return {
    success: false,
    message: 'Exceeded retry limit.',
    code: 500
  };
};


export const getAllVouchers = async () => {
  return await Voucher.find();
};

export const getVoucherById = async (id: string) => {
  return await Voucher.findById(id);
};

export const markVoucherAsUsed = async (id: string) => {
  const voucher = await Voucher.findById(id);
  if (!voucher) {
    return { code: 404, message: 'Voucher not found' };
  }

  if (voucher.isUsed) {
    return { code: 409, message: 'Voucher already used' };
  }

  voucher.isUsed = true;
  await voucher.save();

  return { code: 200, message: 'Voucher marked as used' };
};

export const getVouchersByEventId = async (eventId: string) => {
  return await Voucher.find({ eventId });
};