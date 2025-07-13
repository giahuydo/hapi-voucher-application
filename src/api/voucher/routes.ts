import { ServerRoute } from '@hapi/hapi';
import Joi from 'joi';
import {
  requestVoucher,
  getAllVouchers,
  getVoucherById,
  useVoucher
} from './controller';
import { requestVoucherValidator } from './validator';

const voucherRoutes: ServerRoute[] = [
  // Create voucher for an event
  {
    method: 'POST',
    path: '/events/{eventId}/vouchers',
    options: {
      tags: ['api'],
      description: 'Issue a new voucher for a specific event',
      notes: 'Requires a valid userId in payload. Returns 456 if no voucher left.',
      validate: {
        ...requestVoucherValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Voucher issued successfully',
              schema: Joi.object({
                message: Joi.string(),
                data: Joi.object({
                  code: Joi.string()
                })
              })
            },
            '400': {
              description: 'Bad request - Invalid input'
            },
            '456': {
              description: 'Voucher exhausted - Event has no available vouchers'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      },
      handler: requestVoucher
    }
  },

  // Get all vouchers
  {
    method: 'GET',
    path: '/vouchers',
    options: {
      tags: ['api'],
      description: 'Get all vouchers',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'List of all vouchers',
              schema: Joi.object({
                data: Joi.array().items(Joi.object({
                  _id: Joi.string(),
                  eventId: Joi.string(),
                  code: Joi.string(),
                  issuedTo: Joi.string(),
                  isUsed: Joi.boolean(),
                  createdAt: Joi.date()
                }))
              })
            }
          }
        }
      },
      handler: getAllVouchers
    }
  },

  // Get a voucher by ID
  {
    method: 'GET',
    path: '/vouchers/{id}',
    options: {
      tags: ['api'],
      description: 'Get voucher details by ID',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Voucher details',
              schema: Joi.object({
                data: Joi.object({
                  _id: Joi.string(),
                  eventId: Joi.string(),
                  code: Joi.string(),
                  issuedTo: Joi.string(),
                  isUsed: Joi.boolean(),
                  createdAt: Joi.date()
                })
              })
            },
            '404': {
              description: 'Voucher not found'
            }
          }
        }
      },
      handler: getVoucherById
    }
  },

  // Mark voucher as used
  {
    method: 'PATCH',
    path: '/vouchers/{id}/use',
    options: {
      tags: ['api'],
      description: 'Mark a voucher as used',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Voucher marked as used successfully'
            },
            '404': {
              description: 'Voucher not found'
            },
            '409': {
              description: 'Voucher already used'
            }
          }
        }
      },
      handler: useVoucher
    }
  }
];

export default voucherRoutes;
