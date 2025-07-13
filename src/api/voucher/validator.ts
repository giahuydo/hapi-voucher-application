import Joi from 'joi';

export const requestVoucherValidator = {
  params: Joi.object({
    eventId: Joi.string().required()
  }),
  payload: Joi.object({
    userId: Joi.string().required()
  })
};
