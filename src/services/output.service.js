const { Output } = require('../models');
const logger = require('../config/logger');

/**
 * Add new output value
 * @param {String} bucketId
 * @param {UserId} createdBy
 * @param {String} newValue
 * @returns {Promise<Output>}
 */
const addOutput = async ({ bucketId, value, createdAt = new Date() }) => {
  // find output collection, if not exist, create new
  try {
    const existedOutput = await Output.findOne({ bucketId });

    if (!existedOutput) {
      const outputDoc = new Output({ bucketId });
      outputDoc.output.push({
        value,
        createdAt,
      });

      await outputDoc.save();
      return outputDoc;
    }

    existedOutput.output.push({
      value,
      createdAt,
    });

    await existedOutput.save();
    return existedOutput;
  } catch (error) {
    logger.error(error.message);
  }
};

/**
 * Get all projects
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Project>}
 */
const getProjects = async (filter = {}, options) => {
  return Output.find(filter, options).exec();
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Output.findById(id);
};

module.exports = {
  addOutput,
};
