import { ServerRoute } from '@hapi/hapi';
import Joi from 'joi';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from './controller';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator
} from './validator';

const eventRoutes: ServerRoute[] = [
  // Get all events
  {
    method: 'GET',
    path: '/events',
    options: {
      tags: ['api'],
      description: 'Get all events',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'List of all events',
              schema: Joi.object({
                data: Joi.array().items(Joi.object({
                  _id: Joi.string(),
                  name: Joi.string(),
                  maxQuantity: Joi.number(),
                  issuedCount: Joi.number(),
                  createdAt: Joi.date()
                }))
              })
            }
          }
        }
      },
      handler: getAllEvents
    }
  },

  // Get event by ID
  {
    method: 'GET',
    path: '/events/{id}',
    options: {
      tags: ['api'],
      description: 'Get event details by ID',
      validate: {
        ...eventIdValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Event details',
              schema: Joi.object({
                data: Joi.object({
                  _id: Joi.string(),
                  name: Joi.string(),
                  maxQuantity: Joi.number(),
                  issuedCount: Joi.number(),
                  createdAt: Joi.date()
                })
              })
            },
            '404': {
              description: 'Event not found'
            }
          }
        }
      },
      handler: getEventById
    }
  },

  // Create event
  {
    method: 'POST',
    path: '/events',
    options: {
      tags: ['api'],
      description: 'Create a new event',
      validate: {
        ...createEventValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Event created successfully',
              schema: Joi.object({
                data: Joi.object({
                  _id: Joi.string(),
                  name: Joi.string(),
                  maxQuantity: Joi.number(),
                  issuedCount: Joi.number(),
                  createdAt: Joi.date()
                })
              })
            },
            '400': {
              description: 'Bad request - Invalid input'
            }
          }
        }
      },
      handler: createEvent
    }
  },

  // Update event
  {
    method: 'PUT',
    path: '/events/{id}',
    options: {
      tags: ['api'],
      description: 'Update an event',
      validate: {
        ...eventIdValidator,
        ...updateEventValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Event updated successfully',
              schema: Joi.object({
                data: Joi.object({
                  _id: Joi.string(),
                  name: Joi.string(),
                  maxQuantity: Joi.number(),
                  issuedCount: Joi.number(),
                  createdAt: Joi.date()
                })
              })
            },
            '400': {
              description: 'Bad request - Invalid input'
            },
            '404': {
              description: 'Event not found'
            }
          }
        }
      },
      handler: updateEvent
    }
  },

  // Delete event
  {
    method: 'DELETE',
    path: '/events/{id}',
    options: {
      tags: ['api'],
      description: 'Delete an event',
      validate: {
        ...eventIdValidator,
        failAction: (request, h, err) => {
          throw err;
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Event deleted successfully'
            },
            '404': {
              description: 'Event not found'
            }
          }
        }
      },
      handler: deleteEvent
    }
  }
];

export default eventRoutes; 