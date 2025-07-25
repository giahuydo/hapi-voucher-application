import mongoose, { Document, Schema } from "mongoose";

export interface VoucherDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  code: string;
  issuedTo: string;
  isUsed: boolean;
  createdAt: Date;
}

const voucherSchema = new Schema<VoucherDocument>({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  issuedTo: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Voucher = mongoose.model<VoucherDocument>("Voucher", voucherSchema);

export default Voucher;
