import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
  }],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
  },
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);