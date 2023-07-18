/* eslint-disable prettier/prettier */
const { Monitor } = require('../models');

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
const createProjectStatus = async (bucketId, projectName) => {
  const message = {
    projectId: bucketId,
    projectName,
    contributions: [],
  };
  return Monitor.create(message);
};

const getReportToAnalyzer = async (bucketId) => {
  const reportData = await Monitor.findOne({ projectId: bucketId });
  return reportData.contributions;
};

module.exports = {
  reportProjectStatus,
  createProjectStatus,
  getReportToAnalyzer,
};
