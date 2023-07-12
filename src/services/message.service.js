/* eslint-disable prettier/prettier */
const { Message } = require('../models');

/**
 * Report project status
 * @param {string} projectId
 * @returns {Promise<Message>}
 */
const reportProjectStatus = async (data, bucketId) => {
  const contribution = Object.values(JSON.parse(data));

  const updateData = {
    timestamp: new Date().toISOString(),
    contribution,
  };

  const reportData = await Message.findOne({ projectId: bucketId });

  reportData.contributions.push(updateData);

  await reportData.save();
  return reportData;
};

/**
 * Create a report document
 * @param {string} bucketId
 * @returns {Promise<Message>}
 */
const createProjectStatus = async (bucketId) => {
  const message = {
    projectId: bucketId,
    contributions: [],
  };
  return Message.create(message);
};

const getReportToAnalyzer = async (bucketId) => {
  const reportData = await Message.findOne({ projectId: bucketId });
  const lastestUpdate = [...reportData.contributions].pop();
  return lastestUpdate;
};

module.exports = {
  reportProjectStatus,
  createProjectStatus,
  getReportToAnalyzer,
};
