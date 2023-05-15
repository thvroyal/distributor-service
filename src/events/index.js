const projectEvents = require('./project.event');

const socketEvent = (io, socket) => {
  projectEvents(io, socket);
};

module.exports = socketEvent;
