const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const projectSchema = mongoose.Schema(
  {
    bucketId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [String],
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: String,
      required: true,
    },
    author: {
      id: mongoose.Types.ObjectId,
      name: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
projectSchema.plugin(toJSON);

/**
 * @typedef Project
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
