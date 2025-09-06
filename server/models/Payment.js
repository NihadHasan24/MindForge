import mongoose from "mongoose";

const schema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  validationId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['succeeded', 'processing', 'requires_payment_method', 'canceled'],
  },
  paymentMethod: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model("Payment", schema);