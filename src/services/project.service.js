const { Project } = require('../models');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (userBody) => {
  return Project.create(userBody);
};

module.exports = {
  createProject,
};
