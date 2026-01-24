const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Accept images and PDFs only
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain' // For testing
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected:', file.originalname, 'mimetype:', file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPG, PNG, GIF, and PDF files are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter,
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  }
});

module.exports = upload;