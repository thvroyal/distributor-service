/* eslint-disable prettier/prettier */
const { Monitor } = require('../models');

const updateNumberOfOutput = async (userId, totalOutput, bucketId) => {
  const reportData = await Monitor.findOne({ projectId: bucketId });
  const outputPerUser = reportData.totalOutput;

  // console.log(userId, totalOutput);

  const existingUserIndex = outputPerUser.findIndex((obj) => obj.userId === userId);
  if (existingUserIndex !== -1) {
    outputPerUser[existingUserIndex].numberOfOutput = Number(totalOutput);
  } else {
    outputPerUser.push({
      userId,
      numberOfOutput: Number(totalOutput),
    });
  }

  reportData.totalOutput = outputPerUser;
  await reportData.save();

  // console.log('outputPerUser', outputPerUser);

  return reportData;
};

/**
 * Report project status
 * @param {string} projectId
 * @returns {Promise<Monitor>}
 */
const reportProjectStatus = async (data, bucketId) => {
  const contribution = Object.values(JSON.parse(data));

  const updateData = {
    timestamp: new Date().toISOString(),
    contribution,
  };

  const reportData = await Monitor.findOne({ projectId: bucketId });
  reportData.contributions.push(updateData);

  await reportData.save();
  return reportData;
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
  updateNumberOfOutput,
};
