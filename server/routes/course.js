import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  generateCertificate

} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";
import { createStripeSession, stripeWebhook, stripeSuccess } from "../controllers/stripe.js";
import { listComments, addComment } from "../controllers/comment.js";

const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/generate-certificate/:courseId", isAuth, generateCertificate);

// Stripe payment routes
router.post("/stripe/create-session/:courseId", isAuth, createStripeSession);
router.post("/stripe/webhook", stripeWebhook);
router.get("/stripe/success", isAuth, stripeSuccess);

// Comments for lessons
router.get("/lecture/:lectureId/comments", isAuth, listComments);
router.post("/lecture/:lectureId/comments", isAuth, addComment);

export default router;