import mongoose from "mongoose";

const schema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  validationId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'BDT'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['VALID', 'FAILED', 'CANCELLED', 'UNATTEMPTED', 'EXPIRED'],
  },
  paymentMethod: {
    type: String,
  },
  cardType: {
    type: String,
  },
  cardNo: {
    type: String,
  },
  bankTransactionId: {
    type: String,
  },
  storeAmount: {
    type: Number,
  },
  cardIssuer: {
    type: String,
  },
  cardBrand: {
    type: String,
  },
  cardIssuerCountry: {
    type: String,
  },
  cardIssuerCountryCode: {
    type: String,
  },
  riskLevel: {
    type: String,
  },
  riskTitle: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model("Payment", schema);
// import mongoose from "mongoose";

// const schema = new mongoose.Schema({
//   razorpay_order_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_payment_id: {
//     type: String,
//     required: true,
//   },
//   razorpay_signature: {
//     type: String,
//     required: true,
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export const Payment = mongoose.model("Payment", schema);