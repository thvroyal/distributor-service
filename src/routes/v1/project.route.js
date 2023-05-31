const express = require('express');
const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
const projectController = require('../../controllers/project.controller');
const { upload } = require('../../middlewares/upload');

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    upload.fields([{ name: 'name' }, { name: 'categories' }, { name: 'inputFile' }, { name: 'sourceFile' }]),
    projectController.create
  );

module.exports = router;
