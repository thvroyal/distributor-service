/* eslint-disable prettier/prettier */
const { Message } = require('../models');

/**
 * Create a project
 * @param {string} projectId
 * @returns {Promise<Message>}
 */
const updateProjectStatus = async (data) => {

    const contribution = Object.values(JSON.parse(data))
    const updateData = {
        timestamp: new Date(),
        ...contribution
    }

    // const updatedData = {
    //     timestamp: "2023-07-10T12:00:00.000Z",
    //     contribution: [
    //         {
    //             id: 'user1',
    //             cpuTime: 2000,
    //             dataTransferTime: 0,
    //             nbItems: 3,
    //             throughput: 0.8,
    //             throughputStats: {
    //                 average: 0.75,
    //                 'standard-deviation': 0.12,
    //                 maximum: 0.95,
    //                 minimum: 0.55
    //             },
    //             cpuUsage: 90.5,
    //             cpuUsageStats: {
    //                 average: 85.75,
    //                 'standard-deviation': 9.45,
    //                 maximum: 95.25,
    //                 minimum: 77.15
    //             },
    //             dataTransferLoad: 0,
    //             dataTransferStats: {
    //                 average: 0.00,
    //                 'standard-deviation': 0.00,
    //                 maximum: 0.00,
    //                 minimum: 0.00
    //             }
    //         }]
    // }

    const id = 'xxx'
    const project = await Message.findOne({ id })

    project.contributions.push(
        updateData
    );

    await project.save()
    return project
};

const createProjectStatus = async (data) => {
    const message = {
        projectId: data,
        contributions: []
    }
    return Message.create(message)
}

module.exports = {
    updateProjectStatus,
    createProjectStatus
};
