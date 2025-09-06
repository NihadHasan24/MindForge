import express from "express";
import {
  forgotPassword,
  loginUser,
  myProfile,
  register,
  resetPassword,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { addProgress, getYourProgress} from "../controllers/course.js";
import { getUserCertificates, getLeaderboard } from "../controllers/user.js";
import { chatWithAI } from "../controllers/ai.js";
import TryCatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";


const router = express.Router();
router.post("/user/register", register);
router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);
router.post("/user/forgot", forgotPassword);
router.post("/user/reset", resetPassword);
router.post("/user/progress", isAuth, addProgress);
router.get("/user/progress", isAuth, getYourProgress);
router.get("/certificates", isAuth, getUserCertificates);
router.post("/ai/chat", chatWithAI);
router.get("/leaderboard", getLeaderboard);

// Save a push subscription for the current user
router.post("/user/push-subscribe", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ message: 'Invalid subscription' });
    const exists = (user.pushSubscriptions || []).some((s) => s.endpoint === sub.endpoint);
    if (!exists) user.pushSubscriptions.push(sub);
    await user.save();
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to save subscription' });
  }
});


export default router;