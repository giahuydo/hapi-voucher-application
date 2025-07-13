import Joi from 'joi';

export const registerValidator = {
  payload: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required()
  })
};

export const loginValidator = {
  payload: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
}; 