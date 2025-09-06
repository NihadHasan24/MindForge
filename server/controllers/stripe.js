import { stripe } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { Progress } from "../models/Progress.js";

export const createStripeSession = TryCatch(async (req, res) => {
  const courseId = req.params.courseId;
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.isFree) return res.status(400).json({ message: 'Course is free' });
  if (user.subscription.includes(course._id)) return res.status(400).json({ message: 'You already have this course' });

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
    success_url: `${process.env.FRONTEND_URL}/payment/success/${courseId}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/success/${courseId}?status=cancel`,
    metadata: { courseId: String(course._id), userId: String(user._id) },
  });

  res.status(200).json({ url: session.url });
});

export const stripeSuccess = TryCatch(async (req, res) => {
  const sessionId = req.query.session_id;
  const courseId = req.query.courseId || req.query.id || req.query.course_id || req.params.courseId;
  if (!sessionId) return res.status(400).json({ message: 'Missing session_id' });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not completed' });

  const user = await User.findOne({ email: session.customer_email });
  const course = await Courses.findById(courseId || session.metadata?.courseId);
  if (!user || !course) return res.status(404).json({ message: 'User or Course not found' });

  if (!user.subscription.includes(course._id)) user.subscription.push(course._id);
  const progressExists = await Progress.findOne({ course: course._id, user: user._id });
  if (!progressExists) await Progress.create({ course: course._id, completedLectures: [], user: user._id });
  await user.save();

  await Payment.findOneAndUpdate(
    { transactionId: session.id },
    {
      $setOnInsert: {
        validationId: session.payment_intent,
        course: course._id,
        user: user._id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        paymentStatus: 'succeeded',
        paymentMethod: 'card',
      },
    },
    { upsert: true, new: true }
  );

  res.redirect(`${process.env.FRONTEND_URL}/payment/success/${course._id}?status=success`);
});

export const stripeWebhook = TryCatch(async (req, res) => {
  // In this simplified version we rely on success redirect. For production, verify signature and handle events.
  res.status(200).json({ received: true });
});
