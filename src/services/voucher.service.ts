import mongoose from 'mongoose';
import Event from '../models/event.model';
import Voucher from '../models/voucher.model';
import User from '../models/user.model';
import emailQueue from '../../jobs/queues/email.queue';
import { AppError, NotFoundError, ValidationError, handleError } from '../../utils/errorHandler';
import { transformResponse } from '../../utils/response';
import logger from '../../utils/logger';

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
  const session = await mongoose.startSession();
  
  try {
    logger.info(`Starting voucher issuance for event ${eventId} to user ${userId}`);
    
    session.startTransaction();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      logger.warn(`Invalid eventId format: ${eventId}`);
      throw new ValidationError('Invalid event ID format');
    }

    // Find event with session for transaction
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      throw new NotFoundError('Event not found');
    }

    // Check if vouchers are available
    if (event.issuedCount >= event.maxQuantity) {
      logger.warn(`Event ${eventId} is exhausted. Issued: ${event.issuedCount}, Max: ${event.maxQuantity}`);
      return {
        success: false,
        message: '🎟️ Voucher has been exhausted.',
        code: 456
      };
    }

    // Generate unique voucher code
    const voucherCode = `VC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create voucher
    const vouchers = await Voucher.create([{
      eventId: event._id,
      code: voucherCode,
      issuedTo: userId,
      isUsed: false
    }], { session });

    // Update event issued count
    event.issuedCount += 1;
    await event.save({ session });

    // Commit transaction
    await session.commitTransaction();
    
    logger.info(`Voucher issued successfully. Code: ${voucherCode}, Event: ${eventId}, User: ${userId}`);

    // Add email job to queue
    try {
      // Find user to get email address
      const user = await User.findById(userId);
      if (!user || !user.email) {
        throw new Error('User not found or missing email');
      }
      await emailQueue.add({
        to: user.email,
        code: voucherCode
      });
      logger.info(`Email job added to queue for voucher: ${voucherCode}`);
    } catch (emailError: any) {
      logger.error(`Failed to add email job to queue: ${emailError?.message || emailError}`);
      // Don't fail the voucher issuance if email fails
    }

    return {
      success: true,
      message: '✅ Voucher issued successfully.',
      code: 200,
      data: {
        code: voucherCode
      }
    };

  } catch (error: any) {
    await session.abortTransaction();
    
    logger.error(`Voucher issuance failed for event ${eventId}, user ${userId}:`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      eventId,
      userId
    });

    // Handle specific error types
    if (error instanceof AppError) {
      return {
        success: false,
        message: error.message,
        code: error.statusCode
      };
    }

    // Handle MongoDB transaction errors
    if (error?.name === 'TransientTransactionError' || 
        error?.name === 'WriteConflict' ||
        error?.message?.includes('WriteConflict')) {
      
      logger.warn(`Transient transaction error, retrying voucher issuance for event ${eventId}`);
      
      // Retry once for transient errors
      try {
        return await issueVoucher({ eventId, userId });
      } catch (retryError: any) {
        logger.error(`Retry failed for voucher issuance: ${retryError?.message || 'Unknown error'}`);
        return {
          success: false,
          message: 'Internal server error.',
          code: 500
        };
      }
    }

    return {
      success: false,
      message: 'Internal server error.',
      code: 500
    };

  } finally {
    session.endSession();
  }
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