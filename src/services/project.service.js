const { Project } = require('../models');
const { uploadToS3 } = require('./aws.service');
const { pandoReq } = require('./pando.service');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (userBody, id, uploadFolder) => {
  await uploadToS3(id, uploadFolder);
  const res = await pandoReq(id);
  // eslint-disable-next-line no-param-reassign
  userBody.port = res.port.toString();
  // await Project.deleteMany({ folder: { $exists: false } });
  console.log(`Write project config to database`);
  console.log(`Project created: `);
  console.log(userBody);
  return Project.create(userBody);
};

/**
 * Get all projects
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Project>}
 */
const getProjects = async (filter = {}, options) => {
  return Project.find(filter, options).exec();
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Project.findById(id);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
};
