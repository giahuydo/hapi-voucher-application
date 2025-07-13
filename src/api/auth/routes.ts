import { ServerRoute } from '@hapi/hapi';
import Joi from 'joi';
import { register, login } from './controller';
import { registerValidator, loginValidator } from './validator';

const authRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/auth/register',
    options: {
      tags: ['api', 'auth'],
      description: 'Register a new user',
      notes: 'Creates a new user account and returns JWT token',
      validate: {
        ...registerValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'User registered successfully',
              schema: Joi.object({
                message: Joi.string(),
                data: Joi.object({
                  token: Joi.string(),
                  user: Joi.object({
                    id: Joi.string(),
                    email: Joi.string(),
                    name: Joi.string(),
                    role: Joi.string()
                  })
                })
              })
            },
            '409': {
              description: 'User already exists'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      },
      handler: register
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    options: {
      tags: ['api', 'auth'],
      description: 'Login user',
      notes: 'Authenticates user and returns JWT token',
      validate: {
        ...loginValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Login successful',
              schema: Joi.object({
                message: Joi.string(),
                data: Joi.object({
                  token: Joi.string(),
                  user: Joi.object({
                    id: Joi.string(),
                    email: Joi.string(),
                    name: Joi.string(),
                    role: Joi.string()
                  })
                })
              })
            },
            '401': {
              description: 'Invalid credentials'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      },
      handler: login
    }
  }
];

export default authRoutes; 