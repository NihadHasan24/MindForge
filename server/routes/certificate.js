
import express from "express";
import { generateCertificate } from "../controllers/certificate.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/generate/:courseId", isAuth, generateCertificate);

export default router;