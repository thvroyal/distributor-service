const { joinProject } = require('../controllers/project.controller');

const projectEvents = (ioServer, socket) => {
  socket.on('project:join', joinProject(ioServer));
};

module.exports = projectEvents;
