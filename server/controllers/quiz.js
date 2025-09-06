import TryCatch from "../middlewares/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";
import { Certificate } from "../models/Certificate.js";
import { Payment } from "../models/Payment.js";
import { v4 as uuidv4 } from 'uuid';

export const createQuiz = TryCatch(async (req, res) => {
  const { title, questions, courseId } = req.body;

  if (!Array.isArray(questions) || questions.length < 1) {
    return res.status(400).json({ success: false, message: 'At least one question is required' });
  }
  // Basic structure validation
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q.question !== 'string' || q.question.trim() === '') {
      return res.status(400).json({ success: false, message: `Question ${i + 1} text is required` });
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} must have at least two options` });
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} has invalid correct answer index` });
    }
  }

  let courseRef = null;
  if (courseId) {
    const course = await Courses.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    // Enforce premium-only when a course is attached
    if (course.isFree || Number(course.price) === 0) {
      return res.status(400).json({ success: false, message: 'Only premium courses can have course-bound quizzes' });
    }
    courseRef = course._id;
  }

  const quiz = await Quiz.create({
    title,
    questions,
    course: courseRef, // null means public quiz (for all users)
  });

  res.status(201).json({ success: true, message: "Quiz created successfully", quiz });
});

export const getQuizzes = TryCatch(async (req, res) => {
  const all = await Quiz.find().populate('course', 'title isFree');
  // Return public quizzes + course quizzes for courses the user purchased/enrolled
  const userSubscriptionIds = (req.user?.subscription || []).map((id) => String(id));
  const quizzes = all.filter((q) => !q.course || userSubscriptionIds.includes(String(q.course._id)));
  res.status(200).json({ success: true, quizzes });
});

export const getQuiz = TryCatch(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course', 'title isFree');
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.status(200).json({ success: true, quiz });
});

export const submitQuiz = TryCatch(async (req, res) => {
  const { answers } = req.body;
  const quiz = await Quiz.findById(req.params.id).populate('course', 'isFree');
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return res.status(400).json({ success: false, message: 'Answers array size mismatch' });
  }

  const actingUser = await User.findById(req.user._id);
  if (actingUser && actingUser.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Admins cannot participate in quizzes' });
  }
  // Disallow multiple attempts per user per quiz
  if (actingUser && Array.isArray(actingUser.quizResults)) {
    const existing = actingUser.quizResults.find((r) => String(r.quiz) === String(quiz._id));
    if (existing) {
      // If user already has a perfect score, ensure certificate exists and return existing result
      const isPremiumCourse = !!(quiz.course && !quiz.course.isFree);
      const isPerfect = existing.score === existing.totalQuestions && existing.totalQuestions > 0;
      let quizCertificate = null;
      if (isPremiumCourse && isPerfect) {
        quizCertificate = await Certificate.findOne({ user: actingUser._id, course: quiz.course._id, quiz: quiz._id, type: 'quiz' });
        if (!quizCertificate) {
          quizCertificate = await Certificate.create({ user: actingUser._id, course: quiz.course._id, quiz: quiz._id, type: 'quiz', certificateNumber: uuidv4() });
        }
      }
      return res.status(200).json({ success: true, score: existing.score, totalQuestions: existing.totalQuestions, quizCertificate });
    }
  }

  let score = 0;
  quiz.questions.forEach((q, i) => { if (q.correctAnswer === answers[i]) score++; });

  const user = await User.findById(req.user._id);
  user.quizResults.push({ quiz: quiz._id, score, totalQuestions: quiz.questions.length });
  await user.save();

  let quizCertificate = null;
  const isPremiumCourse = !!(quiz.course && !quiz.course.isFree);
  const isPerfect = score === quiz.questions.length && quiz.questions.length > 0;
  if (isPremiumCourse && isPerfect) {
    quizCertificate = await Certificate.findOne({ user: user._id, course: quiz.course._id, quiz: quiz._id, type: 'quiz' });
    if (!quizCertificate) {
      quizCertificate = await Certificate.create({ user: user._id, course: quiz.course._id, quiz: quiz._id, type: 'quiz', certificateNumber: uuidv4() });
    }
  }

  res.status(200).json({ success: true, score, totalQuestions: quiz.questions.length, quizCertificate });
});