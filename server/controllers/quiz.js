import TryCatch from "../middlewares/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { User } from "../models/User.js";

export const createQuiz = TryCatch(async (req, res) => {
  const { title, questions, courseId } = req.body;

  const quiz = await Quiz.create({
    title,
    questions,
    course: courseId,
  });

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    quiz,
  });
});

export const getQuizzes = TryCatch(async (req, res) => {
  const quizzes = await Quiz.find().populate('course', 'title');

  res.status(200).json({
    success: true,
    quizzes,
  });
});

export const getQuiz = TryCatch(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course', 'title');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  res.status(200).json({
    success: true,
    quiz,
  });
});

export const submitQuiz = TryCatch(async (req, res) => {
  const { answers } = req.body;
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      score++;
    }
  });

  const user = await User.findById(req.user._id);
  user.quizResults.push({
    quiz: quiz._id,
    score,
    totalQuestions: quiz.questions.length,
  });
  await user.save();

  res.status(200).json({
    success: true,
    score,
    totalQuestions: quiz.questions.length,
  });
});