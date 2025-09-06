
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
  // Certificates are only for premium course quizzes
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  type: {
    type: String,
    enum: ['quiz'],
    default: 'quiz',
    required: true,
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

// Ensure one certificate per user per quiz
certificateSchema.index({ user: 1, quiz: 1 }, { unique: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);