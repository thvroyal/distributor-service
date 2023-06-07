const multer = require('multer');
const path = require('node:path');
// const { s3Storage } = require('../config/s3');

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
});

module.exports = {
  upload,
};
