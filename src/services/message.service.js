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
        contribution
    }
    const id = 'xxx'
    const project = await Message.findOne({ projectId: id })

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
