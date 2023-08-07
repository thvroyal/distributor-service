/* eslint-disable prettier/prettier */
const { Monitor } = require('../models');
/**
 * Report project status
 * @param {string} projectId
 * @returns {Promise<Monitor>}
 */

const reportProjectStatus = async (data, bucketId, retryCount = 0) => {
  try {
    const contribution = Object.values(JSON.parse(data));
    const updateData = {
      timestamp: new Date().toISOString(),
      contribution,
    };

    const reportData = await Monitor.findOne({ projectId: bucketId });
    if (!reportData) {
      console.log('VersionError: Not found report data');
      throw new Error('Not found report data');
    }

    const outputPerUser = reportData.totalOutput;

    contribution.forEach((user) => {
      const existingUserIndex = outputPerUser.findIndex((obj) => obj.userId === user.userId);
      if (existingUserIndex !== -1) {
        outputPerUser[existingUserIndex].numberOfOutput = Number(user.totalOutput);
      } else {
        outputPerUser.push({
          userId: user.userId,
          numberOfOutput: Number(user.totalOutput),
        });
      }
    });

    reportData.contributions.push(updateData);
    reportData.totalOutput = outputPerUser;

    await reportData.save();
    return reportData;
  } catch (error) {
    // Handle VersionError and retry the update operation
    if (error.name === 'VersionError' && retryCount < 10) {
      // Retry the update with an incremented retryCount
      console.log('retryCount', retryCount);
      return reportProjectStatus(data, bucketId, retryCount + 1);
    }
    // If the maximum retries are reached or the error is not a VersionError, throw the error
    throw error;
  }
};

/**
 * Create a report document
 * @param {string} bucketId
 * @returns {Promise<Monitor>}
 */
const createProjectStatus = async (newProject) => {
  const { name: projectName, bucketId, computeInfo } = newProject;

  const message = {
    projectId: bucketId,
    projectName,
    totalInput: computeInfo.totalInput,
    totalOutput: [],
    contributions: [],
  };
  return Monitor.create(message);
};

const getReportToAnalyzer = async (bucketId) => {
  const reportData = await Monitor.findOne({ projectId: bucketId });
  return reportData;
};

module.exports = {
  reportProjectStatus,
  createProjectStatus,
  getReportToAnalyzer,
};
