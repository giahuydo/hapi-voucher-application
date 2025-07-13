import Joi from 'joi';

export const createEventValidator = {
  payload: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    maxQuantity: Joi.number().integer().min(1).required()
  })
};

export const updateEventValidator = {
  payload: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    maxQuantity: Joi.number().integer().min(1).optional()
  })
};

export const eventIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
}; 