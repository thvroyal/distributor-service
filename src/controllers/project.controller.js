const httpStatus = require('http-status');
const path = require('node:path');
const fs = require('node:fs');
const { v4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const { bundle } = require('../utils/bundle');
const ApiError = require('../utils/ApiError');
const { createProject } = require('../services/project.service');

const create = catchAsync(async (req, res) => {
  const { inputFile, sourceFile } = req.files;
  const { name, categories } = req.body;
  const id = v4();

  const uploadFolder = path.join(process.cwd(), '/uploads', `${id}`);
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  fs.rename(inputFile[0].path, path.join(uploadFolder, `input.txt`), (err) => {
    if (err) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to save input file');
    }
  });

  const sourceBundledPath = path.join(uploadFolder, `source.js`);

  bundle(sourceFile[0].path, sourceBundledPath, async (error) => {
    if (error) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to bundle files');
    }
    const newProject = {
      name,
      categories,
      folder: uploadFolder,
    };

    // record to database
    const project = await createProject(newProject);

    if (!project) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create project');
    }

    // run project in pando service
    res.status(httpStatus.CREATED).send({ project });
  });
});

module.exports = {
  create,
};
