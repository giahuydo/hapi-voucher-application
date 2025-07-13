import Event from '../models/event.model';

const EDIT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export const requestEditLock = async (eventId: string, userId: string) => {
  const now = new Date();
  const event = await Event.findById(eventId);

  if (!event) return { code: 404, message: 'Event not found' };

  // If no one is editing, acquire the lock
  if (!event.editingBy || !event.editLockAt || event.editLockAt < now) {
    event.editingBy = userId;
    event.editLockAt = new Date(now.getTime() + EDIT_TIMEOUT_MS);
    await event.save();
    return { code: 200, message: 'Edit lock acquired' };
  }

  // if the event is being edited by the same user
  if (event.editingBy === userId) {
    return { code: 200, message: 'Already editing' };
  }

  // if the event is being edited by another user
  return { code: 409, message: 'Event is being edited by another user' };
};


export const releaseEditLock = async (eventId: string, userId: string) => {
  const event = await Event.findById(eventId);
  if (!event) return { code: 404, message: 'Event not found' };

  if (event.editingBy === userId) {
    event.editingBy = null;
    event.editLockAt = null;
    await event.save();
    return { code: 200, message: 'Edit lock released' };
  }
  return { code: 403, message: 'You are not the editing user' };
};

export const maintainEditLock = async (eventId: string, userId: string) => {
  const now = new Date();
  const event = await Event.findById(eventId);
  if (!event) return { code: 404, message: 'Event not found' };

  if (event.editingBy === userId && event.editLockAt && event.editLockAt > now) {
    event.editLockAt = new Date(now.getTime() + EDIT_TIMEOUT_MS);
    await event.save();
    return { code: 200, message: 'Edit lock extended' };
  }
  return { code: 409, message: 'Edit lock not valid or expired' };
};