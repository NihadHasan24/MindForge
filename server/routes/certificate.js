
import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getQuizCertificatePdf } from "../controllers/certificate.js";

const router = express.Router();

// Certificates are generated automatically for premium course quizzes on perfect scores.
// This route is intentionally minimal and can be expanded for future downloads.
router.get("/health", (_req, res) => res.json({ ok: true }));
router.get("/quiz/:id/pdf", isAuth, getQuizCertificatePdf);

export default router;