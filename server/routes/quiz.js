import express from 'express';
import { createQuiz, getQuizzes, getQuiz, submitQuiz } from '../controllers/quiz.js';
import { isAuth, isAdmin } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/new', isAuth, isAdmin, createQuiz);
router.get('/all', isAuth, getQuizzes);
router.get('/:id', isAuth, getQuiz);
router.post('/:id/submit', isAuth, submitQuiz);

export default router;