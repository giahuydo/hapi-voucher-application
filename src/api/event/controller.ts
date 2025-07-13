import { Request, ResponseToolkit } from '@hapi/hapi';
import Event from '../../models/event.model';

export const getAllEvents = async (_req: Request, h: ResponseToolkit) => {
  const events = await Event.find();
  return h.response({ data: events });
};

export const getEventById = async (req: Request, h: ResponseToolkit) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) return h.response({ message: 'Event not found' }).code(404);
  return h.response({ data: event });
};

export const createEvent = async (req: Request, h: ResponseToolkit) => {
  const { name, maxQuantity } = req.payload as { name: string; maxQuantity: number };

  const event = new Event({
    name,
    maxQuantity
  });

  await event.save();
  return h.response({ data: event }).code(201);
};

export const updateEvent = async (req: Request, h: ResponseToolkit) => {
  const { id } = req.params;
  const { name, maxQuantity } = req.payload as { name?: string; maxQuantity?: number };

  const event = await Event.findByIdAndUpdate(
    id,
    { name, maxQuantity },
    { new: true, runValidators: true }
  );

  if (!event) return h.response({ message: 'Event not found' }).code(404);
  return h.response({ data: event });
};

export const deleteEvent = async (req: Request, h: ResponseToolkit) => {
  const { id } = req.params;

  const event = await Event.findByIdAndDelete(id);

  if (!event) return h.response({ message: 'Event not found' }).code(404);
  return h.response({ message: 'Event deleted successfully' });
}; 