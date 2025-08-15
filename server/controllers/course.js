import { sslcz } from '../index.js';
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Certificate } from "../models/Certificate.js";
import { Progress } from "../models/Progress.js";
import { v4 as uuidv4 } from 'uuid';

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
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

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.json({
    courses,
  });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }
    if (course.isFree) {
    // For free courses, directly add to user's subscription
    user.subscription.push(course._id);
    await user.save();

    // Create a progress record for the course
    await Progress.create({
      course: course._id,
      completedLectures: [],
      user: user._id,
    });

    return res.status(200).json({
      message: "Free course added to your subscription",
      redirectUrl: `${process.env.FRONTEND_URL}/course/study/${course._id}`,
    });
  }

  const data = {
    total_amount: course.price,
    currency: 'BDT',
    tran_id: 'REF123' + new Date().getTime(), // use unique tran_id for each api call
    success_url: `${process.env.BACKEND_URL}/api/payment/success/${course._id}`,
    fail_url: `${process.env.BACKEND_URL}/api/payment/fail`,
    cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel`,
    ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
    shipping_method: 'No',
    product_name: course.title,
    product_category: 'Digital',
    product_profile: 'general',
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
  };

  const sslczResponse = await sslcz.init(data);

  res.status(201).json({
    url: sslczResponse.GatewayPageURL,
    course,
  });
});

// export const checkout = TryCatch(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   const course = await Courses.findById(req.params.id);

//   if (user.subscription.includes(course._id)) {
//     return res.status(400).json({
//       message: "You already have this course",
//     });
//   }

//   const options = {
//     amount: Number(course.price * 100),
//     currency: "INR",
//   };

//   const order = await instance.orders.create(options);

//   res.status(201).json({
//     order,
//     course,
//   });
// });

// In your course.js controller file
export const  paymentVerification = TryCatch(async (req, res) => {
  const { tran_id, val_id } = req.body;
  const courseId = req.params.courseId;

  // Verify the payment with SSL Commerz
  const response = await sslcz.validate({ val_id });

  if (response.status === 'VALID') {
    const course = await Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the course to user's subscription if not already present
    if (!user.subscription.includes(course._id)) {
      user.subscription.push(course._id);
    }

    // Create a progress record for the course if not exists
    const progressExists = await Progress.findOne({
      course: course._id,
      user: user._id,
    });

    if (!progressExists) {
      await Progress.create({
        course: course._id,
        completedLectures: [],
        user: user._id,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});
export const paymentSuccess = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const { tran_id, val_id } = req.query;

  // Verify the payment with SSL Commerz
  const response = await sslcz.validate({ val_id });

  if (response.status === 'VALID') {
    try {
      const course = await Courses.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const user = await User.findOne({ email: response.value.cus_email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add the course to user's subscription if not already present
      if (!user.subscription.includes(course._id)) {
        user.subscription.push(course._id);
      }

      // Create a progress record for the course if not exists
      const progressExists = await Progress.findOne({
        course: course._id,
        user: user._id,
      });

      if (!progressExists) {
        await Progress.create({
          course: course._id,
          completedLectures: [],
          user: user._id,
        });
      }

      await user.save();

      // Create a payment record
      await Payment.create({
        transactionId: tran_id,
        validationId: val_id,
        course: course._id,
        user: user._id,
        amount: response.value.total_amount,
      });

      res.redirect(`${process.env.FRONTEND_URL}/payment-success/${courseId}?status=success&tran_id=${tran_id}&val_id=${val_id}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      res.redirect(`${process.env.FRONTEND_URL}/payment-success/${courseId}?status=error`);
    }
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/payment-success/${courseId}?status=failure`);
  }
});
// export const paymentSuccess = TryCatch(async (req, res) => {
//   const { tran_id, val_id } = req.body;
//   const courseId = req.params.courseId;

//   // Verify the payment with SSL Commerz
//   const response = await sslcz.validate({ val_id });

//   if (response.status === 'VALID') {
//     await Payment.create({
//       transactionId: tran_id,
//       validationId: val_id,
//     });

//     const user = await User.findById(req.user._id);
//     const course = await Courses.findById(courseId);

//     user.subscription.push(course._id);

//     await Progress.create({
//       course: course._id,
//       completedLectures: [],
//       user: req.user._id,
//     });

//     await user.save();

//     res.redirect(`${process.env.FRONTEND_URL}/payment-success/${tran_id}`);
//   } else {
//     res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
//   }
// });

// export const paymentVerification = TryCatch(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.Razorpay_Secret)
//     .update(body)
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {
//     await Payment.create({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     });

//     const user = await User.findById(req.user._id);

//     const course = await Courses.findById(req.params.id);

//     user.subscription.push(course._id);

//     await Progress.create({
//       course: course._id,
//       completedLectures: [],
//       user: req.user._id,
//     });

//     await user.save();

//     res.status(200).json({
//       message: "Course Purchased Successfully",
//     });
//   } else {
//     return res.status(400).json({
//       message: "Payment Failed",
//     });
//   }
// });
export const addProgress = TryCatch(async (req, res) => {
  const { courseId, lectureId } = req.query;
  const userId = req.user._id;

  // Check if the user is enrolled in the course
  const user = await User.findById(userId);
  if (!user.subscription.includes(courseId)) {
    return res.status(403).json({
      message: "You are not enrolled in this course",
    });
  }

  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  let progress = await Progress.findOne({
    user: userId,
    course: courseId,
  });

  if (!progress) {
    // If progress doesn't exist, create a new one
    progress = new Progress({
      user: userId,
      course: courseId,
      completedLectures: [],
    });
  }

  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
    await progress.save();
  }

  // Calculate progress percentage
  const totalLectures = course.lectures.length;
  const completedLectures = progress.completedLectures.length;
  const progressPercentage = (completedLectures / totalLectures) * 100;

  // Check if the course is completed and generate certificate if needed
  if (progressPercentage >= course.certificateThreshold) {
    let certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (!certificate) {
      certificate = await Certificate.create({
        user: userId,
        course: courseId,
        certificateNumber: uuidv4()
      });

      return res.status(200).json({
        message: "Course completed and certificate generated",
        progress,
        progressPercentage,
        certificate,
      });
    }
  }

  res.status(200).json({
    message: "Progress updated successfully",
    progress,
    progressPercentage,
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Check if the user is enrolled in the course
  const user = await User.findById(userId);
  if (!user.subscription.includes(courseId)) {
    return res.status(403).json({
      message: "You are not enrolled in this course",
    });
  }

  const progress = await Progress.findOne({
    user: userId,
    course: courseId,
  });

  if (!progress) {
    return res.status(404).json({
      message: "No progress found for this course",
    });
  }

  // Get the total number of lectures in the course
  const course = await Courses.findById(courseId);
  const totalLectures = course.lectures.length;

  const completedLectures = progress.completedLectures.length;
  const progressPercentage = (completedLectures / totalLectures) * 100;

  res.status(200).json({
    progress,
    totalLectures,
    completedLectures,
    progressPercentage,
  });
});

// export const addProgress = TryCatch(async (req, res) => {
//   const progress = await Progress.findOne({
//     user: req.user._id,
//     course: req.query.course,
//   });

//   const { lectureId } = req.query;

//   if (progress.completedLectures.includes(lectureId)) {
//     return res.json({
//       message: "Progress recorded",
//     });
//   }

//   progress.completedLectures.push(lectureId);

//   await progress.save();

//   res.status(201).json({
//     message: "new Progress added",
//   });
// });

// export const getYourProgress = TryCatch(async (req, res) => {
//   const progress = await Progress.find({
//     user: req.user._id,
//     course: req.query.course,
//   });

//   if (!progress) return res.status(404).json({ message: "null" });

//   const allLectures = (await Lecture.find({ course: req.query.course })).length;

//   const completedLectures = progress[0].completedLectures.length;

//   const courseProgressPercentage = (completedLectures * 100) / allLectures;

//   res.json({
//     courseProgressPercentage,
//     completedLectures,
//     allLectures,
//     progress,
//   });
// });