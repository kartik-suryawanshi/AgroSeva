const multer = require('multer');

// Keep in memory so we can upload directly to cloudinary using the buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only JPG, PNG, and PDF are allowed.'));
  }
};

const uploadConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
});

module.exports = uploadConfig;
