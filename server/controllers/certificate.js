import TryCatch from "../middlewares/TryCatch.js";
import { Certificate } from "../models/Certificate.js";
import PDFDocument from 'pdfkit';

// Certificates are only for premium course quizzes.
export const getQuizCertificatePdf = TryCatch(async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.id, user: req.user._id })
    .populate('course', 'title')
    .populate('quiz', 'title');

  if (!cert) return res.status(404).json({ message: 'Certificate not found' });

  const doc = new PDFDocument();
  const filename = `quiz-certificate-${cert.certificateNumber}.pdf`;
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(26).text('Certificate of Achievement', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(14).text(`This certifies that ${req.user.name}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text(`achieved a perfect score on the quiz:`, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(18).text(`${cert.quiz?.title || 'Quiz'}`, { align: 'center' });
  if (cert.course) {
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Course: ${cert.course.title}`, { align: 'center' });
  }
  doc.moveDown(1);
  doc.fontSize(12).text(`Issued on: ${new Date(cert.issueDate).toDateString()}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).text(`Certificate No: ${cert.certificateNumber}`, { align: 'center' });

  doc.end();
});

// Kept for compatibility, but certificates are not generated here anymore
export const generateCertificate = TryCatch(async (_req, res) => {
  return res.status(400).json({ message: 'Certificates are only generated for premium course quizzes.' });
});