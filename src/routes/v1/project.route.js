const express = require('express');
const auth = require('../../middlewares/auth');
const projectController = require('../../controllers/project.controller');
const { upload } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const { projectValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    upload.fields([{ name: 'name' }, { name: 'categories' }, { name: 'inputFile' }, { name: 'sourceFile' }]),
    projectController.create
  )
  .get(validate(projectValidation.getProjects), projectController.getProjects);

router.route('/:projectId').get(validate(projectValidation.getProject), projectController.getProjectById);
module.exports = router;
