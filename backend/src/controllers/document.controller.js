const cloudinary = require('../config/cloudinary');
const Document = require('../models/Document');
const Farmer = require('../models/Farmer');
const { Queue } = require('bullmq');

// Connect to BullMQ queue for OCR processing
const ocrQueue = new Queue('ocr-process', { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });

exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { docType } = req.body;
  if (!docType) {
    return res.status(400).json({ success: false, message: 'docType is required' });
  }

  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer profile not found' });

  // Upload to Cloudinary buffer
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
  
  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    folder: `agro-portal/farmers/${farmer._id}`,
    resource_type: 'auto',
  });

  const newDoc = await Document.create({
    farmerId: farmer._id,
    docType,
    originalFileName: req.file.originalname,
    cloudinaryPublicId: uploadResponse.public_id,
    cloudinaryUrl: uploadResponse.secure_url,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    verificationStatus: 'pending'
  });

  // Attach reference to farmer profile
  farmer.documents.push(newDoc._id);
  await farmer.save();

  // Enqueue BullMQ job
  await ocrQueue.add('process-ocr', { documentId: newDoc._id });

  res.status(201).json({ success: true, message: 'Document uploaded and processing started', data: newDoc });
};

exports.getDocuments = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer profile not found' });

  const documents = await Document.find({ farmerId: farmer._id }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: documents });
};
