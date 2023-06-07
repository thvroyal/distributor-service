const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const config = require('./config');

const s3 = new S3Client({
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  region: config.aws.region,
});

const s3Storage = multerS3({
  s3, // s3 instance
  bucket: 'my-images', // change it as per your project requirement
  acl: 'public-read', // storage access type
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldName });
  },
  key: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.fieldName}_${file.originalname}`;
    cb(null, fileName);
  },
});

module.exports = {
  s3Storage,
};
