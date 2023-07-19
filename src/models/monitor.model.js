/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const monitorSchema = mongoose.Schema({
  projectId: String,
  projectName: String,
  totalInput: Number,
  contributions: [
    {
      timestamp: String,
      contribution: [
        {
          userId: String,
          userName: String,
          cpuTime: Number,
          totalOutput: Number,
          dataTransferTime: Number,
          nbItems: Number,
          throughput: Number,
          throughputStats: {
            average: Number,
            'standard-deviation': Number,
            maximum: Number,
            minimum: Number,
          },
          cpuUsage: Number,
          cpuUsageStats: {
            average: Number,
            'standard-deviation': Number,
            maximum: Number,
            minimum: Number,
          },
          dataTransferLoad: Number,
          dataTransferStats: {
            average: Number,
            'standard-deviation': Number,
            maximum: Number,
            minimum: Number,
          },
        },
      ],
    },
  ],
});

// add plugin that converts mongoose to json
monitorSchema.plugin(toJSON);

/**
 * @typedef LogProject
 */
const Monitor = mongoose.model('monitor', monitorSchema);

module.exports = Monitor;
