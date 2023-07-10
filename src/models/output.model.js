const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const outputSchema = mongoose.Schema(
  {
    bucketId: String,
    output: [
      {
        value: String,
        createdAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
outputSchema.plugin(toJSON);

/**
 * @typedef Output
 */
const Output = mongoose.model('Output', outputSchema);

module.exports = Output;
