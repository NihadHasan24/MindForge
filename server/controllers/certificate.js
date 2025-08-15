
import TryCatch from "../middlewares/TryCatch.js";
import { Certificate } from "../models/Certificate.js";
import PDFDocument from 'pdfkit';

export const generateCertificate = TryCatch(async (req, res) => {
  const certificate = await Certificate.findOne({
    user: req.user._id,
    course: req.params.courseId
  }).populate('course');

  if (!certificate) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  // Generate PDF certificate
  const doc = new PDFDocument();
  let filename = `certificate-${certificate.certificateNumber}.pdf`;

  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text('Certificate of Completion', 100, 80);
  doc.fontSize(15).text(`This is to certify that ${req.user.name}`, 100, 160);
  doc.fontSize(15).text(`has successfully completed the course:`, 100, 190);
  doc.fontSize(20).text(certificate.course.title, 100, 220);
  doc.fontSize(15).text(`Issue Date: ${certificate.issueDate.toDateString()}`, 100, 300);
  doc.fontSize(15).text(`Certificate Number: ${certificate.certificateNumber}`, 100, 330);

  doc.end();
});