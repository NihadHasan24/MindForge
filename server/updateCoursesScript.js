import mongoose from 'mongoose';
import { Courses } from './models/Courses.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateCourses = async () => {
  try {
    // Update all existing courses to set isFree to false by default
    await Courses.updateMany({}, { $set: { isFree: false } });
    console.log('All courses updated successfully');
  } catch (error) {
    console.error('Error updating courses:', error);
  } finally {
    mongoose.disconnect();
  }
};

updateCourses();