/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const messageSchema = mongoose.Schema({
    projectId: String,
    contributions: [{
        timestamp: String,
        contribution: [{
            id: String,
            cpuTime: Number,
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
            }
        }]
    }]
});

// add plugin that converts mongoose to json
messageSchema.plugin(toJSON);

/**
 * @typedef LogProject
 */
const Message = mongoose.model('message', messageSchema);

module.exports = Message;
