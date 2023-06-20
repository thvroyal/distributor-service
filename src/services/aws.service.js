const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const httpStatus = require('http-status');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const S3 = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: 'AKIAV6JUFBZ7HTPRPCRR',
    secretAccessKey: '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',
  },
});

async function deleteUploadFolder(folderPath) {
  try {
    fs.rmdirSync(folderPath, { recursive: true });
  } catch (err) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to delete folder');
  }
}

const createFolder = async (folderName) => {
  const params = {
    Bucket: 'mybucketforpando',
    Key: `${folderName}/`,
  };

  const command = new PutObjectCommand(params);

  try {
    await S3.send(command);
  } catch (error) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create folder');
  }
};

// Function to upload a file to a specific folder in S3
const uploadFile = async (folderName, uploadFolder, name) => {
  const fileContent = fs.readFileSync(`${uploadFolder}/${name}`);

  const params = {
    Bucket: 'mybucketforpando',
    Key: `${folderName}/${name}`,
    Body: fileContent,
  };

  const command = new PutObjectCommand(params);

  await S3.send(command);
};

const uploadToS3 = async (folderName, uploadFolder) => {
  try {
    await createFolder(folderName);
    await uploadFile(folderName, uploadFolder, 'input.txt');
    await uploadFile(folderName, uploadFolder, 'source.js');
    await deleteUploadFolder(uploadFolder);

    // console.log('Upload file to S3: input.txt, source.js');
  } catch (error) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create project');
  }
};

module.exports = { uploadToS3 };
