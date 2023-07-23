const { Project } = require('../models');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (userBody) => {
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

const updateProjectTotalOutput = async (projectId, totalOutput) => {
  const project = await getProjectById(projectId);
  project.computeInfo.totalOutput = totalOutput;
  await project.save();
  return project;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProjectTotalOutput,
};
