import mongoose, { Document, Schema } from "mongoose";

export interface EventDocument extends Document {
  name: string;
  maxQuantity: number;
  issuedCount: number;
  createdAt: Date;
  editingBy: string | null;
  editLockAt: Date | null;
}

const eventSchema = new Schema<EventDocument>({
  name: {
    type: String,
    required: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
  },
  issuedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  editingBy: {
    type: String,
    default: null
  },
  editLockAt: {
    type: Date,
    default: null
  }
});

const Event = mongoose.model<EventDocument>("Event", eventSchema);

export default Event;
