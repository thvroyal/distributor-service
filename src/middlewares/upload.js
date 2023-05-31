const multer = require('multer');
const path = require('node:path');
// const { s3Storage } = require('../config/s3');

// function sanitizeFile(file, cb) {
//   // Define the allowed extension
//   const fileExts = ['.js', '.txt'];

//   // Check allowed extensions
//   const isAllowedExt = fileExts.includes(file.extname(file.originalname.toLowerCase()));

//   // Mime type must be an image
//   const isAllowedMimeType = file.mimetype.startsWith('image/');

//   if (isAllowedExt && isAllowedMimeType) {
//     return cb(null, true); // no errors
//   }
//   // pass error msg to callback, which can be display in frontend
//   cb('Error: File type not allowed!');
// }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), '/uploads'));
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  // fileFilter: (req, file, callback) => {
  //   sanitizeFile(file, callback);
  // },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2mb file size
  },
});

module.exports = {
  upload,
};
