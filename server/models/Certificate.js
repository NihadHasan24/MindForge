
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  certificateNumber: {
    type: String,
    unique: true
  }
});

export const Certificate = mongoose.model("Certificate", certificateSchema);