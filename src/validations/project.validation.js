const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getProjects = {
  query: Joi.object().keys({
    name: Joi.string(),
    id: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProject = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getProjects,
  getProject,
};
