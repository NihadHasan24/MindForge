import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, isFree, expectedLectures} = req.body;

  const image = req.file;

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
    isFree: isFree === 'true',
    expectedLectures: Number(expectedLectures) || 0,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;

  const file = req.file;
  if (!file || !file.path) {
    return res.status(400).json({ message: 'Video file is required' });
  }

  // Normalize path for static serving
  const videoPath = file.path.replace(/\\/g, '/');

  const lecture = await Lecture.create({
    title,
    description,
    video: videoPath,
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const courseLectureStatus = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const count = await Lecture.countDocuments({ course: course._id });
  res.json({ courseId: course._id, expectedLectures: course.expectedLectures || 0, currentLectures: count, complete: count >= (course.expectedLectures || 0) });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  // Route is already protected by isAdmin; allow admins to toggle roles
  const user = await User.findById(req.params.id);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  // Prevent modifying superadmin accounts
  if (user.mainrole === "superadmin")
    return res.status(403).json({ message: "Cannot modify superadmin role" });

  if (user.role === "user") {
    user.role = "admin";
    await user.save();
    return res.status(200).json({ message: "Role updated to admin" });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();
    return res.status(200).json({ message: "Role updated to user" });
  }

  res.status(400).json({ message: "Unsupported role state" });
});