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

const updateProjectError = async (bucketId) => {
  const project = await Project.findOne({ bucketId });
  if (!project) {
    logger.error(`Not found project with bucketId: ${bucketId}`);
    return;
  }
  project.status = 'error';
  await project.save();
};

/**
 * Get all projects
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Project>}
 */
const getProjects = async (filter = {}, options) => {
  return Project.find(filter, options).sort({ createdAt: 'desc' }).exec();
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Project.findById(id);
};

const getProjectByAuthor = async (authorId) => {
  return Project.find({ 'author.id': authorId });
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

  if (data.totalOutput === data.totalInput) {
    project.status = 'completed';
  }

  project.computeInfo.totalOutput = totalOutput;
  await project.save();
  return project;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getProjectByAuthor,
  updateProjectTotalOutput,
  updateProjectError,
};
