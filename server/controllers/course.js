import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
// Certificates are only generated for premium course quizzes
import { Progress } from "../models/Progress.js";
// import { v4 as uuidv4 } from 'uuid';
import { stripe } from '../index.js';

export const getAllCourses = TryCatch(async (req, res) => {
  const { q, category, isFree, minPrice, maxPrice } = req.query;

  const filter = {};
  if (q) {
    const qLower = String(q).toLowerCase().trim();
    const isKeywordOnly = qLower === 'premium' || qLower === 'paid' || qLower === 'free';
    if (!isKeywordOnly) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { createdBy: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }
    if (qLower.includes('premium') || qLower.includes('paid')) {
      filter.isFree = false;
    }
    if (qLower.includes('free')) {
      filter.isFree = true;
    }
  }
  if (category) filter.category = category;
  if (typeof isFree !== 'undefined') filter.isFree = isFree === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const results = await Courses.find(filter).lean();
  const courses = results.map((c) => ({
    ...c,
    isPremium: !c.isFree && Number(c.price) > 0,
  }));
  res.json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  // Allow admins to manage/view lectures without enrollment
  if (user.role === 'admin') return res.json({ lectures });

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  // Allow admins to view a specific lecture without enrollment
  if (user.role === 'admin') return res.json({ lecture });

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: { $in: req.user.subscription } }).lean();
  const payments = await Payment.find({ user: req.user._id, paymentStatus: 'succeeded' }).select('course').lean();
  const paidCourseIds = new Set(payments.map((p) => String(p.course)));
  const annotated = courses.map((c) => ({
    ...c,
    isPremiumForUser: paidCourseIds.has(String(c._id)) || (!c.isFree && Number(c.price) > 0),
  }));

  res.json({ courses: annotated });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (user.role === "admin")
    return res.status(403).json({ message: "Admins cannot purchase courses" });

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({ message: "You already have this course" });
  }

  if (course.isFree) {
    user.subscription.push(course._id);
    await user.save();
    await Progress.create({ course: course._id, completedLectures: [], user: user._id });
    return res.status(200).json({ message: "Free course added to your subscription", redirectUrl: `${process.env.FRONTEND_URL}/course/study/${course._id}` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: course.title },
        unit_amount: Math.round(Number(course.price) * 100),
      },
      quantity: 1,
    }],
    customer_email: user.email,
    success_url: `${process.env.FRONTEND_URL}/payment/success/${course._id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/success/${course._id}?status=cancel`,
    metadata: { courseId: String(course._id), userId: String(user._id) },
  });

  res.status(201).json({ url: session.url, course });
});

export const paymentSuccess = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const { session_id } = req.query;

  if (!session_id) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/success/${courseId}?status=failure`);
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status === 'paid') {
    const user = await User.findById(session.metadata.userId);
    const course = await Courses.findById(session.metadata.courseId);

    if (user && course) {
      if (!user.subscription.includes(course._id)) {
        user.subscription.push(course._id);
      }

      const progressExists = await Progress.findOne({ course: course._id, user: user._id });
      if (!progressExists) {
        await Progress.create({ course: course._id, completedLectures: [], user: user._id });
      }

      await user.save();

      try {
        await Payment.create({
          transactionId: session.payment_intent,
          validationId: session.id,
          course: course._id,
          user: user._id,
          amount: Number(session.amount_total) / 100,
          currency: session.currency,
          paymentStatus: session.payment_status,
          paymentMethod: session.payment_method_types[0],
          cardType: session.payment_method_types[0],
          cardNo: session.payment_method_details?.card?.last4,
          bankTransactionId: session.payment_intent,
          storeAmount: Number(session.amount_total) / 100,
          cardIssuer: session.payment_method_details?.card?.brand,
          cardBrand: session.payment_method_details?.card?.brand,
          cardIssuerCountry: session.payment_method_details?.card?.country,
          cardIssuerCountryCode: session.payment_method_details?.card?.country_code,
          riskLevel: session.risk_level,
          riskTitle: session.risk_title,
        });
      } catch (e) {
        // ignore duplicate transaction errors
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/success/${courseId}?status=success`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/payment/success/${courseId}?status=failure`);
  }
});

export const paymentVerification = TryCatch(async (req, res) => {
  const { tran_id, val_id } = req.body;
  const courseId = req.params.courseId;

  // Verify the payment with SSL Commerz
  // This function is no longer used as payment verification is handled by Stripe.
  // Keeping it for now as it might be used elsewhere or for historical context.
  // If SSLCommerz is no longer needed, this function can be removed.
  // For now, we'll return a placeholder response.
  res.status(200).json({
    success: true,
    message: "Payment verification handled by Stripe.",
  });
});

export const addProgress = TryCatch(async (req, res) => {
  const courseId = req.query.courseId || req.query.course;
  const { lectureId } = req.query;
  const userId = req.user._id;

  if (!courseId || !lectureId) {
    return res.status(400).json({ message: "Missing course or lecture id" });
  }

  // Check if the user is enrolled in the course
  const user = await User.findById(userId);
  if (!user.subscription.includes(courseId)) {
    return res.status(403).json({ message: "You are not enrolled in this course" });
  }

  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  let progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress) {
    progress = new Progress({ user: userId, course: courseId, completedLectures: [] });
  }

  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
    await progress.save();
  }

  const targetLectures = Number(course.expectedLectures) > 0
    ? Number(course.expectedLectures)
    : await Lecture.countDocuments({ course: courseId });
  const totalLectures = targetLectures;
  const completedLectures = progress.completedLectures.length;
  const completedClamped = Math.min(completedLectures, totalLectures);
  const courseProgressPercentage = Math.min(100, Math.round(((completedClamped * 100) / totalLectures) * 100) / 100);

  res.status(200).json({
    message: "Progress recorded",
    courseProgressPercentage,
    completedLectures,
    allLectures: totalLectures,
    progress: [progress],
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const courseId = req.query.courseId || req.query.course;
  const userId = req.user._id;

  if (!courseId) return res.status(400).json({ message: "Missing course id" });

  // Check if the user is enrolled in the course
  const user = await User.findById(userId);
  if (!user.subscription.includes(courseId)) {
    return res.status(403).json({ message: "You are not enrolled in this course" });
  }

  const course = await Courses.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const progressDoc = await Progress.findOne({ user: userId, course: courseId });

  const targetLectures = Number(course.expectedLectures) > 0
    ? Number(course.expectedLectures)
    : await Lecture.countDocuments({ course: courseId });
  const totalLectures = targetLectures;
  const completedLectures = progressDoc ? progressDoc.completedLectures.length : 0;
  const completedClamped = Math.min(completedLectures, totalLectures);
  const courseProgressPercentage = totalLectures > 0 ? Math.min(100, Math.round(((completedClamped * 100) / totalLectures) * 100) / 100) : 0;

  res.status(200).json({
    courseProgressPercentage,
    completedLectures,
    allLectures: totalLectures,
    progress: progressDoc ? [progressDoc] : [],
  });
});
export const generateCertificate = TryCatch(async (req, res) => {
  return res.status(400).json({ message: "Certificates are only generated for premium course quizzes." });
});