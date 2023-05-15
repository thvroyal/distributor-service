const catchAsync = require('../utils/catchAsync');

const createProject = catchAsync(async (req, res) => {
  // TODO: pando computing will be implemented here
  res.send('Project was created successfully');
});

const joinProject = (ioServer) => (data) => {
  const { projectId, userId } = data;
  const roomName = `project:${projectId}`;
  ioServer.join(roomName);
  ioServer.to(roomName).emit('project:joined', { projectId, userId });
};

module.exports = {
  createProject,
  joinProject,
};
