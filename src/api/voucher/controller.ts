import * as voucherService from '../../services/voucher.service';
import { Request, ResponseToolkit } from '@hapi/hapi';

export const getAllVouchers = async (_req: Request, h: ResponseToolkit) => {
  const vouchers = await voucherService.getAllVouchers();
  return h.response({ data: vouchers });
};

export const getVoucherById = async (req: Request, h: ResponseToolkit) => {
  const { id } = req.params;
  const voucher = await voucherService.getVoucherById(id);

  if (!voucher) return h.response({ message: 'Not found' }).code(404);
  return h.response({ data: voucher });
};

export const useVoucher = async (req: Request, h: ResponseToolkit) => {
  const { id } = req.params;
  const result = await voucherService.markVoucherAsUsed(id);
  return h.response({ message: result.message }).code(result.code);
};

export const requestVoucher = async (req: Request, h: ResponseToolkit) => {
  const { eventId } = req.params as { eventId: string };
  const { userId } = req.payload as { userId: string };

  const { success, message, code, data } = await voucherService.issueVoucher({ eventId, userId });

  return h
    .response({ message, data: success ? data : undefined })
    .code(success ? 200 : code || 500);
};
