const AWS = require('aws-sdk');
const fs = require('fs');
const fssync = require('fs').promises;
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// Set up AWS configuration with your credentials
AWS.config.update({
  accessKeyId: 'AKIAV6JUFBZ7HTPRPCRR',
  secretAccessKey: '4abKrOR+S7x4B59WtfKWciXq+IZTBEpTm533359h',
  region: 'ap-southeast-2',
});

// Create an instance of the S3 service
const s3 = new AWS.S3();

async function deleteFile(folderPath) {
  try {
    fs.rmdirSync(folderPath, { recursive: true });
  } catch (err) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to delete folder');
  }
}

// Function to create a folder (S3 bucket is a flat structure, so "folders" are essentially object keys)
const createFolder = async (folderName) => {
  const params = {
    Bucket: 'mybucketforpando',
    Key: `${folderName}/`,
  };
  await s3.putObject(params).promise();
};

// Function to upload a file to a specific folder in S3
const uploadFile = async (folderName, uploadFolder, name) => {
  const fileContent = fs.readFileSync(`${uploadFolder}/${name}`);

  const params = {
    Bucket: 'mybucketforpando',
    Key: `${folderName}/${name}`,
    Body: fileContent,
  };

  await s3.upload(params).promise();
};

const uploadToS3 = async (folderName, uploadFolder) => {
  try {
    await createFolder(folderName);
    await uploadFile(folderName, uploadFolder, 'input.txt');
    await uploadFile(folderName, uploadFolder, 'source.js');

    console.log('Upload file to S3: input.txt, source.js');

    // await deleteFile(`${uploadFolder}`);
  } catch (error) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create');
  }
};

module.exports = { uploadToS3 };
