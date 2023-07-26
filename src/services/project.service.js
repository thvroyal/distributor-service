const logger = require('../config/logger');
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

const updateProjectTotalOutput = async (data, bucketId) => {
  const totalOutput = data.totalOutput.reduce((acc, cur) => {
    const curValue = Number(cur.numberOfOutput);
    return acc + curValue;
  }, 0);

  const project = await Project.findOne({ bucketId });
  if (!project) {
    logger.error(`Not found project with bucketId: ${bucketId}`);
    return;
  }

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
