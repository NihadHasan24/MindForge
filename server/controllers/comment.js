import TryCatch from "../middlewares/TryCatch.js";
import { Comment } from "../models/Comment.js";
import { Lecture } from "../models/Lecture.js";

export const listComments = TryCatch(async (req, res) => {
  const lectureId = req.params.lectureId;
  const comments = await Comment.find({ lecture: lectureId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json({ comments });
});

export const addComment = TryCatch(async (req, res) => {
  const lectureId = req.params.lectureId;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' });
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
  const comment = await Comment.create({ lecture: lectureId, user: req.user._id, content });
  res.status(201).json({ message: 'Comment added', comment });
});


